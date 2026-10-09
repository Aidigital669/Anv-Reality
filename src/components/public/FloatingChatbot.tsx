'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Building2,
  ExternalLink,
  PhoneCall,
  MapPin,
  ArrowRight
} from 'lucide-react';

export interface MatchedPropertyPreview {
  id: string;
  name: string;
  locality: string;
  price: string;
  bhk?: string;
  sqft?: string;
  status?: string;
  image?: string;
  url: string;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  actionType?: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp';
  matchedProperties?: MatchedPropertyPreview[];
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-init-1',
  role: 'assistant',
  content:
    'Welcome to **ANV REEALTY** (https://www.anvreealty.com/). Are you looking to buy, rent, sell or invest in property in Pune and PCMC?',
  timestamp: 'Just now'
};

function renderBoldText(text: string, keyPrefix: string): React.ReactNode {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const subparts: React.ReactNode[] = [];
  let lastIdx = 0;
  let boldMatch: RegExpExecArray | null;

  while ((boldMatch = boldRegex.exec(text)) !== null) {
    if (boldMatch.index > lastIdx) {
      subparts.push(text.substring(lastIdx, boldMatch.index));
    }
    subparts.push(
      <strong key={`${keyPrefix}-b-${boldMatch.index}`} className="font-bold text-white">
        {boldMatch[1]}
      </strong>
    );
    lastIdx = boldMatch.index + boldMatch[0].length;
  }

  if (lastIdx < text.length) {
    subparts.push(text.substring(lastIdx));
  }

  return <React.Fragment key={keyPrefix}>{subparts}</React.Fragment>;
}

function renderFormattedContent(content: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderBoldText(textBefore, `pre-${match.index}`));
    }

    const linkText = match[1];
    const linkUrl = match[2];

    parts.push(
      <Link
        key={`link-${match.index}`}
        href={linkUrl}
        className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 transition-colors cursor-pointer inline-flex items-center gap-0.5 mx-0.5"
      >
        <span>{linkText}</span>
        <ExternalLink className="w-2.5 h-2.5 inline shrink-0 opacity-80" />
      </Link>
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(renderBoldText(remainingText, `post-${lastIndex}`));
  }

  return parts;
}

export function FloatingChatbot() {
  const pathname = usePathname();

  // Chatbot is by default OPEN as requested by the user
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide on CRM and Admin back-office panels
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/crm')) {
    return null;
  }

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessagesList = [...messages, userMsg];
    setMessages(newMessagesList);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessagesList.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();
      const replyContent =
        data?.reply ||
        'Thank you for reaching ANV REEALTY. Our central advisory desk at +91 9766137115 / WhatsApp +91 93730 20701 is ready to assist you.';

      let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' | undefined = data?.actionType;
      const matchedProperties: MatchedPropertyPreview[] = data?.matchedProperties || [];

      if (!actionType) {
        const lower = text.toLowerCase();
        if (lower.includes('sell') || lower.includes('list') || lower.includes('owner')) {
          actionType = 'seller_enquiry';
        } else if (
          matchedProperties.length > 0 ||
          lower.includes('buy') ||
          lower.includes('flat') ||
          lower.includes('bhk') ||
          lower.includes('office') ||
          lower.includes('propert')
        ) {
          actionType = 'buyer_enquiry';
        } else if (lower.includes('call') || lower.includes('whatsapp') || lower.includes('contact')) {
          actionType = 'whatsapp';
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType,
        matchedProperties
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          'Our central advisory desk (East Wing, M.G. Road, Camp, Pune 01) is available at +91 9766137115 or WhatsApp +91 93730 20701 to assist with your property requirement.',
        timestamp: 'Just now',
        actionType: 'whatsapp'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content:
          'Welcome to **ANV REEALTY** (https://www.anvreealty.com/). Are you looking to buy, rent, sell or invest in property in Pune and PCMC?',
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div
      aria-label="Anv Reealty AI Property Concierge"
      className="fixed bottom-6 left-4 sm:left-6 z-50 select-none"
    >
      {/* 1. COLLAPSED FLOATING LAUNCHER WITH MESSAGING ICON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-zinc-950 flex items-center justify-center shadow-[0_10px_30px_rgba(245,158,11,0.55)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.75)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-amber-400/40 group-hover:ring-amber-400/70"
          title="Open Anv AI Concierge Chatbot"
          aria-label="Open AI Property Concierge"
        >
          {/* Pulsing Aura Ping */}
          <span className="absolute -inset-1 rounded-full bg-amber-400 opacity-40 animate-ping pointer-events-none duration-1000" />

          {/* Primary Messaging Icon - Solid & High Contrast */}
          <MessageSquare className="w-7 h-7 text-zinc-950 fill-zinc-950 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />

          {/* Online Indicator Green Dot with White Contrast Ring */}
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-md" />

          {/* Hover Tooltip Pill on Left */}
          <span className="absolute left-16 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/95 backdrop-blur-md text-white text-[11px] font-bold border border-amber-500/40 shadow-2xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Concierge (Online)</span>
          </span>
        </button>
      )}

      {/* 2. EXPANDED CHATBOT WINDOW (BY DEFAULT OPEN) */}
      {isOpen && (
        <div className="relative w-[340px] sm:w-[380px] h-[520px] max-h-[calc(100vh-5rem)] bg-zinc-950/95 backdrop-blur-2xl rounded-3xl border border-amber-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(217,119,6,0.25)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-all">
          {/* HEADER */}
          <div className="relative px-4 py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-950 to-amber-950/60 border-b border-amber-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Messaging Avatar Icon with Live Badge */}
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-zinc-950 flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare className="w-5 h-5 text-zinc-950 fill-zinc-950" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-zinc-950 rounded-full animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-white text-sm tracking-tight">
                    Anv AI Concierge
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Pune Luxury Advisory &bull; Online</span>
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close chatbot"
                aria-label="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs leading-relaxed">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-zinc-950 font-semibold shadow-md rounded-br-xs'
                      : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800/80 shadow-md rounded-bl-xs'
                  }`}
                >
                  {renderFormattedContent(msg.content)}
                </div>

                <span className="text-[9px] text-zinc-500 mt-1 px-1" suppressHydrationWarning>
                  {msg.timestamp}
                </span>

                {/* 1. INTERACTIVE PROPERTY PREVIEW CARDS (DIRECT /properties/[id] LINKS) */}
                {msg.role === 'assistant' && msg.matchedProperties && msg.matchedProperties.length > 0 && (
                  <div className="mt-2 space-y-2 w-full max-w-[92%]">
                    {msg.matchedProperties.map((prop) => (
                      <div
                        key={prop.id}
                        className="group relative overflow-hidden rounded-2xl bg-zinc-900/95 border border-amber-500/30 hover:border-amber-400/60 p-2.5 transition-all duration-300 shadow-lg hover:shadow-amber-500/10"
                      >
                        <div className="flex gap-2.5 items-start">
                          {/* Property Thumbnail */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-zinc-800">
                            <Image
                              src={prop.image || '/LogoAnv.png'}
                              alt={prop.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="64px"
                            />
                            {prop.status && (
                              <span className="absolute bottom-0 inset-x-0 bg-zinc-950/85 text-[8px] text-amber-300 text-center font-bold py-0.5 truncate px-0.5">
                                {prop.status}
                              </span>
                            )}
                          </div>

                          {/* Property Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                              {prop.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-400">
                              <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span className="truncate">{prop.locality}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-800/80">
                              <div>
                                <span className="text-[11px] font-extrabold text-amber-400">{prop.price}</span>
                                {prop.bhk && (
                                  <span className="text-[9px] text-zinc-400 ml-1">({prop.bhk})</span>
                                )}
                              </div>
                              <Link
                                href={prop.url}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-[10px] hover:brightness-110 shadow-xs transition cursor-pointer"
                              >
                                <span>View Details</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. CONTEXTUAL ACTION SHORTCUT BUTTONS IN BOT RESPONSE */}
                {msg.role === 'assistant' && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {/* View Property Details or View Verified Properties */}
                    {msg.matchedProperties && msg.matchedProperties.length > 0 ? (
                      <>
                        <Link
                          href={msg.matchedProperties[0].url}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/25 to-amber-400/25 hover:from-amber-500/35 hover:to-amber-400/35 text-amber-300 border border-amber-500/40 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Building2 className="w-3 h-3 text-amber-400" />
                          <span>View Property Details</span>
                        </Link>
                        <button
                          onClick={() => {
                            const el = document.getElementById('search-results-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            else window.location.href = '/#search-results-section';
                          }}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>All Verified Properties</span>
                        </button>
                      </>
                    ) : msg.actionType === 'buyer_enquiry' ? (
                      <button
                        onClick={() => {
                          const el = document.getElementById('search-results-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          else window.location.href = '/#search-results-section';
                        }}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Building2 className="w-3 h-3 text-amber-400" />
                        <span>View Verified Properties</span>
                      </button>
                    ) : null}

                    {/* Match with Active Buyers (for sellers) */}
                    {msg.actionType === 'seller_enquiry' && (
                      <a
                        href="/#search-results-section"
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3 h-3 text-amber-400" />
                        <span>Match with Active Buyers</span>
                      </a>
                    )}

                    {/* Official WhatsApp Desk */}
                    <a
                      href="https://wa.me/919373020701?text=Hello%20ANV%20REEALTY,%20I%20am%20inquiring%20via%20the%20AI%20Concierge."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp Desk: 93730 20701</span>
                    </a>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs py-1">
                <div className="w-6 h-6 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-amber-500/20 bg-zinc-900/60 shrink-0"
          >
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 focus-within:border-amber-500/50 rounded-2xl px-3 py-1.5 transition">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about properties, localities, sell flat..."
                className="flex-1 bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none font-medium"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-7 h-7 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-zinc-950 flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Call / Helpline Footer */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 pt-1.5 font-medium">
              <span>Advisory Desk: <strong className="text-zinc-400">+91 9766137115</strong></span>
              <span className="text-amber-400/80 font-bold">ANV REEALTY Pune</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
