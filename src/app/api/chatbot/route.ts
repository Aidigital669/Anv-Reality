import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { query, queryOne } from "@/lib/db";
import {
  ANV_COMPANY_PROFILE,
  getChatbotLiveInventory,
  buildChatbotSystemPrompt,
  extractMatchedProperties,
  getKnowledgeFallbackResponse,
  isUnrelatedRealEstateQuery,
  isConversationalAffirmative,
  isConversationalNegative
} from "@/lib/chatbot-knowledge";
import { stripDuplicatePropertyBulletLinks } from "@/lib/unrelated-query";
import { generateWithGemini } from "@/lib/gemini";
import { getMatchingBuyerDemands } from "@/lib/buyer-demands-service";

export const dynamic = "force-dynamic";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const OFFICIAL_PHONE = ANV_COMPANY_PROFILE.primaryPhone;
const OFFICIAL_EMAIL = ANV_COMPANY_PROFILE.email;

function sanitizeChatbotReply(text: string): string {
  if (!text) return "";
  return text
    .replace(/\(?https?:\/\/(?:www\.)?anvreealty\.com\/?\)?/gi, "")
    .replace(/(\]\([^)]+\))\s*(?:->|→)\s*:?/g, "$1:")
    .replace(/(\*\*\s*(?:->|→)\s*:?)/g, ":")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractContactDetails(text: string): { email: string | null; phone: string | null } {
  if (!text) return { email: null, phone: null };

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  const emailMatch = text.match(emailRegex);
  let email = emailMatch ? emailMatch[0].trim() : null;

  // Also catch informal/test email formats like test@123
  if (!email) {
    const looseEmail = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/);
    if (looseEmail) {
      email = looseEmail[0].trim();
    }
  }

  let phone: string | null = null;
  // Candidates: 7 to 15 digits sequence, optionally prefixed with + or with spaces/dashes
  const phoneCandidates = text.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/g) || [];
  for (const cand of phoneCandidates) {
    const digits = cand.replace(/\D/g, '');
    // Avoid pure years (2024, 2025, 2026), single numbers, or small digits
    if (digits.length >= 7 && digits.length <= 15) {
      phone = cand.trim();
      break;
    }
  }

  return { email, phone };
}

function extractVisitorName(text: string, email: string | null, phone: string | null): string {
  if (!text && !email) return 'Verified Client';

  // 1. Check explicit pattern: "My name is Prem", "I am Prem", "Name: Prem", "Name - Prem"
  const explicitMatch = text.match(/(?:my name is|i am|this is|name\s*[:=-]?)\s*([A-Za-z.]{2,20}(?:\s+[A-Za-z.]{2,20}){0,2})/i);
  if (explicitMatch && explicitMatch[1]) {
    const raw = explicitMatch[1].trim();
    if (!/^(?:contact|phone|email|mobile|here|is|details|number)$/i.test(raw)) {
      return raw.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  // 2. Strip phone, email, and symbols to isolate the name
  let stripped = text;
  if (phone) {
    stripped = stripped.replace(phone, ' ');
  }
  // Strip any remaining digit sequences
  stripped = stripped.replace(/\+?\d[\d\s\-()]{5,}\d/g, ' ').replace(/\d+/g, ' ');
  if (email) {
    stripped = stripped.replace(email, ' ');
  }
  // Strip email-like patterns (e.g. test@123)
  stripped = stripped.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/g, ' ');

  // Strip common connectors and stop words
  const stopWords = /^(?:and|or|with|here|is|are|my|contact|number|phone|email|mail|details|call|whatsapp|mob|mobile|tel|please|thanks|thank you|regards|sir|madam|hello|hi|hey)$/i;

  const candidateWords = stripped
    .replace(/[^\w\s.]|_/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !stopWords.test(w) && /^[A-Za-z.]+$/.test(w));

  if (candidateWords.length >= 1 && candidateWords.length <= 3) {
    const candidateName = candidateWords
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    if (candidateName.length >= 2 && candidateName.length <= 35) {
      return candidateName;
    }
  }

  // 3. Derive from email if available: "prem@gmail.com" -> "Prem" (ignore generic like test, admin, user)
  if (email) {
    const prefix = email.split('@')[0];
    const clean = prefix.replace(/[._\d-]+/g, ' ').trim();
    const cleanLower = clean.toLowerCase();
    if (clean.length >= 2 && !['test', 'admin', 'user', 'info', 'mail', 'guest'].includes(cleanLower)) {
      return clean
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return 'Verified Client';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required." },
        { status: 400 }
      );
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const userLower = lastUserMessage.toLowerCase().trim();
    const hasChatHistory = messages.length > 1;

    // Check greeting
    const isGreeting = /^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola|sup)\b/i.test(userLower);

    // Check conversational affirmative or negative intent (e.g. "yes", "sure", "ok", "arrange details", "connect me", "interested")
    const isAffirmative = isConversationalAffirmative(lastUserMessage);
    const isNegative = isConversationalNegative(lastUserMessage);

    // Check seller intent
    const isSeller =
      userLower.includes("sell") ||
      userLower.includes("seller") ||
      userLower.includes("listing") ||
      userLower.includes("list my") ||
      userLower.includes("owner") ||
      userLower.includes("want a buyer") ||
      userLower.includes("want buyer") ||
      userLower.includes("need a buyer") ||
      userLower.includes("need buyer") ||
      userLower.includes("find buyer") ||
      userLower.includes("match buyer") ||
      userLower.includes("have a flat") ||
      userLower.includes("have an office") ||
      userLower.includes("have a property") ||
      userLower.includes("have commercial") ||
      ((userLower.includes("buyer") || userLower.includes("buyers")) &&
        (userLower.includes("commercial") ||
          userLower.includes("office") ||
          userLower.includes("flat") ||
          userLower.includes("property") ||
          userLower.includes("for my")));

    // Intercept unusual / non-real-estate search terms (e.g. "i need oil", "pizza", "shoes", "cars")
    // NEVER trigger unrelated search for conversational affirmatives, negations, or ongoing conversation dialogue!
    if (!isAffirmative && !isNegative && isUnrelatedRealEstateQuery(lastUserMessage, hasChatHistory)) {
      return NextResponse.json({
        success: true,
        reply:
          `No real estate results found for **"${lastUserMessage.trim()}"**.\n\n` +
          `**ANV REEALTY** is an exclusive luxury & commercial real estate advisory firm in Pune. We specialize strictly in verified property acquisitions, commercial leases, and buyer-seller matchmaking.\n\n` +
          `Please explore verified property options in our Pune portfolio using the suggested searches below:`,
        actionType: "unrelated_search",
        unrelatedQuery: lastUserMessage.trim(),
        suggestedSearches: [
          'Commercial Office Spaces in Pune',
          'Medical & Hospital Premises',
          '3 & 4 BHK Luxury Residences',
          'Prime Retail Showrooms',
          'High-ROI Pre-Leased Properties',
          'Sell Property / Match Verified Buyers',
          'Properties in Baner & Balewadi',
          'Properties in Koregaon Park'
        ],
        matchedProperties: [],
        matchedBuyerDemands: [],
        source: "accuracy_guard"
      });
    }

    // 1. Automatic Lead Capture: Detect Phone Number or Email
    const { email: detectedEmail, phone: detectedPhone } = extractContactDetails(lastUserMessage);

    if (detectedPhone || detectedEmail) {
      const liveInventory = await getChatbotLiveInventory();
      const code = `LD-${Math.floor(1000 + Math.random() * 9000)}`;
      const visitorName = extractVisitorName(lastUserMessage, detectedEmail, detectedPhone);
      const clientPhone = detectedPhone ? detectedPhone.replace(/[\s\-()]/g, '') : OFFICIAL_PHONE;
      const clientEmail = detectedEmail || OFFICIAL_EMAIL;

      // Extract context & property interest from conversation history
      const fullConversationText = messages.map((m: any) => m.content || '').join('\n');
      const convLower = fullConversationText.toLowerCase();

      let propertyInterest = 'Curated Luxury / Commercial Portfolio';
      let location = 'Pune, Maharashtra';
      let bhk = 'Custom Typology';
      let budget = '₹1.5 - 2.5 Cr';

      if (convLower.includes('hospital') || convLower.includes('clinic') || convLower.includes('medical') || convLower.includes('healthcare')) {
        propertyInterest = 'Hospital / Medical Premises';
        bhk = 'Commercial Healthcare / Clinic';
        budget = '₹2.5 - 10 Cr';
      } else if (convLower.includes('office') || convLower.includes('workspace') || convLower.includes('it park') || convLower.includes('corporate')) {
        propertyInterest = 'Commercial Office Space';
        bhk = 'Grade-A Commercial';
        budget = '₹2 - 8 Cr';
      } else if (convLower.includes('showroom') || convLower.includes('shop') || convLower.includes('retail')) {
        propertyInterest = 'Prime Commercial Showroom';
        bhk = 'Ground / Retail Space';
        budget = '₹3 - 12 Cr';
      } else if (convLower.includes('prelease') || convLower.includes('yield') || convLower.includes('roi')) {
        propertyInterest = 'Pre-Leased Commercial (High ROI)';
        bhk = 'Pre-Leased Asset';
        budget = '₹3 - 15 Cr';
      } else if (convLower.includes('sell') || convLower.includes('buyer for') || isSeller) {
        propertyInterest = 'Property Sale / Buyer Matchmaking';
        bhk = 'Sale Portfolio';
        budget = 'Market Valuation';
      } else if (convLower.includes('4 bhk') || convLower.includes('4bhk')) {
        propertyInterest = '4 BHK Ultra-Luxury Residence';
        bhk = '4 BHK';
        budget = '₹3 - 6 Cr';
      } else if (convLower.includes('3 bhk') || convLower.includes('3bhk')) {
        propertyInterest = '3 BHK Luxury Residence';
        bhk = '3 BHK';
        budget = '₹1.5 - 3 Cr';
      }

      const PUNE_LOCALITIES = [
        'Baner', 'Balewadi', 'Koregaon Park', 'Kalyani Nagar', 'Viman Nagar',
        'Camp', 'Undri', 'Kharadi', 'Hinjawadi', 'Wakad', 'Bavdhan', 'Aundh', 'Senapati Bapat Road', 'Shivajinagar'
      ];
      for (const loc of PUNE_LOCALITIES) {
        if (convLower.includes(loc.toLowerCase())) {
          location = `${loc}, Pune`;
          break;
        }
      }

      const recentChatSummary = messages
        .slice(-5)
        .map((m: any) => `${m.role === 'user' ? 'Client' : 'AI'}: ${m.content}`)
        .join('\n');

      const detailedNotes = `[AI Concierge Lead Intake]\n- Contact: ${clientPhone} | ${clientEmail}\n- Stated Interest: ${propertyInterest}\n- Location: ${location}\n- Direct User Input: "${lastUserMessage}"\n- Conversation History:\n${recentChatSummary}`;

      // Insert directly into CRM Leads table (crm_leads) so it appears immediately in /crm
      try {
        await queryOne(
          `INSERT INTO crm_leads (
            code, name, phone, email, designation, company, residence, is_nri, nri_tag,
            location, property_interest, bhk, carpet_sqft, budget, budget_raw,
            source, source_type, status, stage, temperature, assigned_to, notes,
            created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, 'Prospective Client', $5, $6, false, null,
            $7, $8, $9, 'As per requirement', $10, 17500000,
            'AI Chatbot Concierge', $11, 'New Lead', 'new', 'hot', 'Senior Advisory Desk', $12,
            NOW(), NOW()
          )
          ON CONFLICT (code) DO NOTHING;`,
          [
            code,
            visitorName,
            clientPhone,
            clientEmail,
            isSeller ? 'Property Owner' : 'Private Investor',
            location,
            location,
            propertyInterest,
            bhk,
            budget,
            isSeller ? 'seller' : 'chatbot',
            detailedNotes
          ]
        );
      } catch (crmErr: any) {
        console.error("CRM Lead insertion error:", crmErr.message);
      }

      // Also record in WebsiteEnquiry
      try {
        await query(
          `INSERT INTO "WebsiteEnquiry" (name, email, phone, message, subject, source, status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, 'AI Chatbot', 'New', NOW(), NOW())`,
          [
            visitorName,
            clientEmail,
            clientPhone,
            `Chatbot Lead Capture [Ref: ${code}]: "${lastUserMessage.slice(0, 500)}"`,
            isSeller ? `New Seller Lead [${code}]` : `New Chatbot Lead [${code}] - ${propertyInterest}`
          ]
        );
      } catch (enqErr: any) {
        console.log("WebsiteEnquiry recording notice:", enqErr.message);
      }

      // Clean, polite thank-you message without walls of text or repeating property cards
      const reply = `Thank you! Our senior property advisor will reach out to you shortly.`;

      return NextResponse.json({
        success: true,
        reply,
        actionType: "whatsapp",
        leadCreated: true,
        leadCode: code,
        leadName: visitorName,
        matchedProperties: [],
        matchedBuyerDemands: [],
        source: "crm_lead_bridge"
      });
    }

    // 2. Fetch up-to-the-second live database inventory
    const liveInventory = await getChatbotLiveInventory();
    const fullSystemPrompt = buildChatbotSystemPrompt(liveInventory);

    // 3. PRIMARY ENGINE: Google Gemini AI (Ultra-fast, accurate, strict source boundaries)
    try {
      const geminiReply = await generateWithGemini({
        systemPrompt: fullSystemPrompt,
        messages: messages.slice(-8),
        temperature: 0.2,
        maxOutputTokens: 1200,
        preferredModel: "gemini-2.5-flash"
      });

      if (geminiReply && geminiReply.trim()) {
        const reply = sanitizeChatbotReply(geminiReply);

        if (isSeller) {
          const matchedBuyerDemands = await getMatchingBuyerDemands(lastUserMessage, 3);
          return NextResponse.json({
            success: true,
            reply,
            actionType: "seller_enquiry",
            matchedProperties: [],
            matchedBuyerDemands,
            source: "gemini"
          });
        }

        const matchedProperties =
          isGreeting || isAffirmative || isNegative ? [] : extractMatchedProperties(lastUserMessage, reply, liveInventory);
        let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' = isAffirmative
          ? "whatsapp"
          : matchedProperties.length > 0 ||
            userLower.includes("buy") ||
            userLower.includes("bhk") ||
            userLower.includes("office") ||
            userLower.includes("shop") ||
            userLower.includes("plot") ||
            userLower.includes("propert") ||
            userLower.includes("view") ||
            userLower.includes("hospital")
            ? "buyer_enquiry"
            : "whatsapp";

        const finalReply = matchedProperties.length > 0 ? stripDuplicatePropertyBulletLinks(reply) : reply;

        return NextResponse.json({
          success: true,
          reply: finalReply,
          actionType,
          matchedProperties,
          matchedBuyerDemands: [],
          source: "gemini"
        });
      }
    } catch (geminiErr: any) {
      console.log("Gemini API fallback notice:", geminiErr.message);
    }

    // 4. SECONDARY ENGINE: OpenAI (if configured and quota available)
    if (openai) {
      try {
        const formattedMessages = [
          {
            role: "system" as const,
            content: fullSystemPrompt
          },
          ...messages.slice(-8).map((m: any) => ({
            role: m.role === "user" ? ("user" as const) : ("assistant" as const),
            content: String(m.content || "")
          }))
        ];

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          max_tokens: 1200,
          temperature: 0.2
        });

        const rawReply = completion.choices[0]?.message?.content?.trim();
        if (rawReply) {
          const reply = sanitizeChatbotReply(rawReply);
          if (isSeller) {
            const matchedBuyerDemands = await getMatchingBuyerDemands(lastUserMessage, 3);
            return NextResponse.json({
              success: true,
              reply,
              actionType: "seller_enquiry",
              matchedProperties: [],
              matchedBuyerDemands,
              source: "openai"
            });
          }

          const matchedProperties =
            isGreeting || isAffirmative || isNegative ? [] : extractMatchedProperties(lastUserMessage, reply, liveInventory);
          let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' = isAffirmative
            ? "whatsapp"
            : matchedProperties.length > 0 ||
              userLower.includes("buy") ||
              userLower.includes("bhk") ||
              userLower.includes("office") ||
              userLower.includes("shop") ||
              userLower.includes("plot") ||
              userLower.includes("propert") ||
              userLower.includes("view") ||
              userLower.includes("hospital")
              ? "buyer_enquiry"
              : "whatsapp";

          const finalReply = matchedProperties.length > 0 ? stripDuplicatePropertyBulletLinks(reply) : reply;

          return NextResponse.json({
            success: true,
            reply: finalReply,
            actionType,
            matchedProperties,
            matchedBuyerDemands: [],
            source: "openai"
          });
        }
      } catch (aiErr: any) {
        console.log("OpenAI Chatbot fallback triggered:", aiErr.message);
      }
    }

    // 5. TERTIARY ENGINE: Comprehensive Rule-Based Fallback using Live Inventory
    const fallbackResult = getKnowledgeFallbackResponse(lastUserMessage, liveInventory);
    const matchedBuyerDemands = isSeller ? await getMatchingBuyerDemands(lastUserMessage, 3) : [];
    const fallbackMatched = isSeller || isGreeting ? [] : (fallbackResult.matchedProperties || []);
    const sanitizedFallback = sanitizeChatbotReply(fallbackResult.reply);
    const finalFallbackReply = fallbackMatched.length > 0 ? stripDuplicatePropertyBulletLinks(sanitizedFallback) : sanitizedFallback;

    return NextResponse.json({
      success: true,
      reply: finalFallbackReply,
      actionType: isSeller ? "seller_enquiry" : fallbackResult.actionType,
      matchedProperties: fallbackMatched,
      matchedBuyerDemands,
      source: "knowledge_engine"
    });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate chatbot response",
        reply:
          `Welcome to **ANV REEALTY**! Our central advisory desk at East Wing, M.G. Road, Camp, Pune is available at ${OFFICIAL_PHONE} or WhatsApp ${ANV_COMPANY_PROFILE.secondaryPhone} to assist with your property requirement.`,
        actionType: "whatsapp",
        matchedProperties: []
      },
      { status: 200 }
    );
  }
}
