import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { query } from "@/lib/db";
import {
  ANV_COMPANY_PROFILE,
  getChatbotLiveInventory,
  buildChatbotSystemPrompt,
  extractMatchedProperties,
  getKnowledgeFallbackResponse
} from "@/lib/chatbot-knowledge";
import { generateWithGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const OFFICIAL_PHONE = ANV_COMPANY_PROFILE.primaryPhone;
const OFFICIAL_EMAIL = ANV_COMPANY_PROFILE.email;

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
            "New Chatbot Lead Capture (Camp Office Desk)"
          ]
        );
      } catch (err: any) {
        console.log("Chatbot lead recording notice:", err.message);
      }
    }

    // 2. Fetch up-to-the-second live database inventory (Automated Scraper & Direct Ingestion Training)
    const liveInventory = await getChatbotLiveInventory();
    const fullSystemPrompt = buildChatbotSystemPrompt(liveInventory);

    // 3. PRIMARY ENGINE: Google Gemini AI (Ultra-fast, accurate, strict source boundaries)
    try {
      const geminiReply = await generateWithGemini({
        systemPrompt: fullSystemPrompt,
        messages: messages.slice(-8),
        temperature: 0.2,
        maxOutputTokens: 600,
        preferredModel: "gemini-2.5-flash"
      });

      if (geminiReply && geminiReply.trim()) {
        const reply = geminiReply.trim();
        const matchedProperties = extractMatchedProperties(lastUserMessage, reply, liveInventory);

        // Determine contextual action button
        let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' | undefined;
        const userLower = lastUserMessage.toLowerCase();
        if (
          userLower.includes("sell") ||
          userLower.includes("list my") ||
          userLower.includes("owner") ||
          userLower.includes("want a buyer") ||
          userLower.includes("find buyer")
        ) {
          actionType = "seller_enquiry";
        } else if (
          matchedProperties.length > 0 ||
          userLower.includes("buy") ||
          userLower.includes("bhk") ||
          userLower.includes("office") ||
          userLower.includes("shop") ||
          userLower.includes("plot") ||
          userLower.includes("propert") ||
          userLower.includes("view")
        ) {
          actionType = "buyer_enquiry";
        } else {
          actionType = "whatsapp";
        }

        return NextResponse.json({
          success: true,
          reply,
          actionType,
          matchedProperties,
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
          max_tokens: 500,
          temperature: 0.2
        });

        const reply = completion.choices[0]?.message?.content?.trim();
        if (reply) {
          const matchedProperties = extractMatchedProperties(lastUserMessage, reply, liveInventory);
          let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' | undefined;
          const userLower = lastUserMessage.toLowerCase();
          if (
            userLower.includes("sell") ||
            userLower.includes("list my") ||
            userLower.includes("owner") ||
            userLower.includes("want a buyer") ||
            userLower.includes("find buyer")
          ) {
            actionType = "seller_enquiry";
          } else if (
            matchedProperties.length > 0 ||
            userLower.includes("buy") ||
            userLower.includes("bhk") ||
            userLower.includes("office") ||
            userLower.includes("shop") ||
            userLower.includes("plot") ||
            userLower.includes("propert") ||
            userLower.includes("view")
          ) {
            actionType = "buyer_enquiry";
          } else {
            actionType = "whatsapp";
          }

          return NextResponse.json({
            success: true,
            reply,
            actionType,
            matchedProperties,
            source: "openai"
          });
        }
      } catch (aiErr: any) {
        console.log("OpenAI Chatbot fallback triggered:", aiErr.message);
      }
    }

    // 5. TERTIARY ENGINE: Comprehensive Rule-Based Fallback using Live Inventory
    const fallbackResult = getKnowledgeFallbackResponse(lastUserMessage, liveInventory);

    return NextResponse.json({
      success: true,
      reply: fallbackResult.reply,
      actionType: fallbackResult.actionType,
      matchedProperties: fallbackResult.matchedProperties || [],
      source: "knowledge_engine"
    });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    const defaultFallback = await getChatbotLiveInventory();
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate chatbot response",
        reply:
          `Welcome to ANV REEALTY (https://www.anvreealty.com/)! Our central advisory desk at East Wing, M.G. Road, Camp, Pune is available at ${OFFICIAL_PHONE} or WhatsApp ${ANV_COMPANY_PROFILE.secondaryPhone} to assist with your property requirement.`,
        actionType: "whatsapp",
        matchedProperties: defaultFallback.slice(0, 2)
      },
      { status: 200 }
    );
  }
}
