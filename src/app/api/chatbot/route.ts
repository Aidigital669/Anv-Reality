import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { query } from "@/lib/db";
import {
  ANV_COMPANY_PROFILE,
  getChatbotLiveInventory,
  buildChatbotSystemPrompt,
  extractMatchedProperties,
  getKnowledgeFallbackResponse,
  isUnrelatedRealEstateQuery
} from "@/lib/chatbot-knowledge";
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

    // Check greeting
    const isGreeting = /^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola|sup)\b/i.test(userLower);

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
    if (isUnrelatedRealEstateQuery(lastUserMessage)) {
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
    const phoneMatch = lastUserMessage.match(/(?:\+91|91)?\s?[6-9]\d{9}/);
    const emailMatch = lastUserMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    if (phoneMatch || emailMatch) {
      try {
        await query(
          `INSERT INTO "WebsiteEnquiry" (name, email, phone, message, subject, source, status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, 'AI Chatbot', 'New', NOW(), NOW())`,
          [
            "Chatbot Visitor",
            emailMatch ? emailMatch[0] : OFFICIAL_EMAIL,
            phoneMatch ? phoneMatch[0].replace(/\s+/g, "") : OFFICIAL_PHONE,
            `Chatbot Ingestion: "${lastUserMessage.slice(0, 500)}"`,
            isSeller ? "New Seller Lead Capture (Camp Office Desk)" : "New Chatbot Lead Capture (Camp Office Desk)"
          ]
        );
      } catch (err: any) {
        console.log("Chatbot lead recording notice:", err.message);
      }
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

        const matchedProperties = isGreeting ? [] : extractMatchedProperties(lastUserMessage, reply, liveInventory);
        let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' =
          matchedProperties.length > 0 ||
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

        return NextResponse.json({
          success: true,
          reply,
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

          const matchedProperties = isGreeting ? [] : extractMatchedProperties(lastUserMessage, reply, liveInventory);
          let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' =
            matchedProperties.length > 0 ||
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

          return NextResponse.json({
            success: true,
            reply,
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

    return NextResponse.json({
      success: true,
      reply: sanitizeChatbotReply(fallbackResult.reply),
      actionType: isSeller ? "seller_enquiry" : fallbackResult.actionType,
      matchedProperties: isSeller || isGreeting ? [] : (fallbackResult.matchedProperties || []),
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
