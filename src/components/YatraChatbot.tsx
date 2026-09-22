import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Compass,
  MapPin,
  Calendar,
  Users,
  Ticket,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Place, StateData } from "@/types";
import { PLACES_DATA, placesByState, getLoadedPlaces } from "@/data/places";
import { STATES_DATA } from "@/data/states";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";

export interface BookingData {
  destination: string;
  dates: string;
  travelers: number | string;
  type: string;
  reference: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  booking?: BookingData | null;
  timestamp?: number;
}

const MOODS = [
  {
    label: "Adventurous",
    moodPrompt: "I'm in the mood for adventure — high energy, outdoors, maybe a bit of adrenaline.",
    emoji: "🏔️",
  },
  {
    label: "Relaxed",
    moodPrompt: "I want to relax and unwind, somewhere calm and slow-paced.",
    emoji: "🌴",
  },
  {
    label: "Spiritual",
    moodPrompt: "I'm feeling spiritual and want somewhere peaceful and sacred.",
    emoji: "🪔",
  },
  {
    label: "Romantic",
    moodPrompt: "I want something romantic for a trip with my partner.",
    emoji: "✨",
  },
  {
    label: "Family-friendly",
    moodPrompt: "I'm planning a family trip, need something fun for kids too.",
    emoji: "🐘",
  },
  {
    label: "Buzzing city",
    moodPrompt: "I want nightlife, food, and a lively city buzz.",
    emoji: "🌆",
  },
];

interface YatraChatbotProps {
  onSelectPlace?: (place: Place) => void;
  onSelectState?: (state: StateData) => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  places?: Place[];
}

export function YatraChatbot({
  onSelectPlace,
  onSelectState,
  initialPrompt,
  onClearInitialPrompt,
  places,
}: YatraChatbotProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content:
        "Namaste! I'm Yatra 🙏 Tell me a destination you're curious about, tap a mood below, or say you'd like to book something — I'll take it from there.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  // Handle external trigger prompts (e.g. from Place details or State guide)
  useEffect(() => {
    if (initialPrompt) {
      setIsOpen(true);
      handleSendMessage(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  const parseBooking = (rawText: string): { cleanText: string; booking: BookingData | null } => {
    const bookingMatch = rawText.match(/```booking\s*([\s\S]*?)```/);
    if (!bookingMatch) {
      return { cleanText: rawText.trim(), booking: null };
    }

    try {
      const parsed = JSON.parse(bookingMatch[1].trim());
      const cleanText = rawText.replace(/```booking[\s\S]*?```/, "").trim();
      return {
        cleanText,
        booking: {
          destination: parsed.destination || "India Destination",
          dates: parsed.dates || "Upcoming Season",
          travelers: parsed.travelers || 2,
          type: parsed.type || "Curated Travel Experience",
          reference: parsed.reference || "YAT-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        },
      };
    } catch (e) {
      return { cleanText: rawText.replace(/```booking[\s\S]*?```/, "").trim(), booking: null };
    }
  };

  const handleSendMessage = async (userText: string, displayText?: string) => {
    if (!userText.trim()) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: displayText || userText,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Map message history to server format
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      const rawReply = data.reply || "I'm having trouble connecting right now — please try again in a moment.";

      const { cleanText, booking } = parseBooking(rawReply);

      if (booking) {
        userAccountService.recordDemoBooking(user?.id || "guest", {
          reference: booking.reference,
          destination: booking.destination,
          dates: booking.dates,
          travelers: booking.travelers,
          type: booking.type,
        });
      }

      const assistantMessage: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: cleanText || "Here is your booking confirmation details below:",
        booking,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Yatra Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "I'm having a little trouble connecting right now — please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSendMessage(input);
    }
  };

  const handleCopyRef = (refCode: string) => {
    navigator.clipboard.writeText(refCode);
    setCopiedRef(refCode);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "initial-greeting",
        role: "assistant",
        content:
          "Namaste! I'm Yatra 🙏 Tell me a destination you're curious about, tap a mood below, or say you'd like to book something — I'll take it from there.",
      },
    ]);
  };

  // Find destination matching place or state to navigate
  const handleNavigateDestination = (destinationName: string) => {
    const term = destinationName.toLowerCase();
    const placesPool = places && places.length > 0 ? places : getLoadedPlaces();
    const matchedPlace = placesPool.find(
      (p) => p.name.toLowerCase().includes(term) || term.includes(p.name.toLowerCase())
    );
    if (matchedPlace && onSelectPlace) {
      onSelectPlace(matchedPlace);
      return;
    }
    const matchedState = STATES_DATA.find(
      (s) => s.name.toLowerCase().includes(term) || term.includes(s.name.toLowerCase())
    );
    if (matchedState && onSelectState) {
      onSelectState(matchedState);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3"
          >
            {/* Pulsing Hint Tooltip */}
            <motion.div
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-full border border-[#D98A1C]/50 bg-[#17233D]/95 px-4 py-2 text-xs font-medium text-[#F7EFE1] shadow-2xl backdrop-blur-md cursor-pointer hover:bg-[#17233D] transition-colors"
            >
              <Sparkles className="size-3.5 text-[#F2A93B]" />
              <span>Ask Yatra — AI Travel Companion</span>
            </motion.div>

            {/* Circular Launcher */}
            <button
              id="yatra-launcher-btn"
              onClick={() => setIsOpen(true)}
              aria-label="Open Yatra India Travel Chatbot"
              className="group relative flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-full bg-[#F2A93B] text-[#17233D] shadow-[0_12px_35px_rgba(242,169,59,0.4)] transition-all duration-300 hover:scale-108 hover:bg-[#D98A1C] active:scale-95"
            >
              {/* Outer Golden Glow Pulse */}
              <span className="absolute inset-0 rounded-full bg-[#F2A93B] opacity-40 animate-ping pointer-events-none" />

              {/* Chat Bubble Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 sm:size-7 transition-transform group-hover:rotate-6"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden bg-[#FBF3E4] border border-[#ECDFC4] shadow-[0_25px_60px_rgba(16,26,48,0.45)] transition-all duration-300",
              isExpanded
                ? "inset-2 sm:inset-4 md:inset-auto md:bottom-4 md:right-4 md:w-[540px] md:h-[calc(100vh-48px)] rounded-2xl sm:rounded-3xl"
                : "inset-x-2 bottom-2 sm:inset-x-auto sm:right-4 sm:bottom-4 w-auto sm:w-[410px] max-w-[calc(100vw-16px)] sm:max-w-[420px] h-[580px] max-h-[calc(100dvh-16px)] rounded-t-2xl sm:rounded-t-[30px] rounded-b-xl sm:rounded-b-2xl"
            )}
          >
            {/* Header with Royal Navy & Traditional Arched Scallop Motif */}
            <div className="relative bg-[#17233D] px-4 sm:px-5 py-3.5 sm:py-4 text-[#F7EFE1] overflow-hidden rounded-t-2xl sm:rounded-t-[30px] border-b border-[#ECDFC4]/20 shadow-md">
              {/* Subtle Jaali / Scalloped Cartographic Pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 18px 0, transparent 12px, #17233D 13px)`,
                  backgroundSize: "36px 20px",
                  backgroundPosition: "bottom",
                }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#F2A93B]/15 border border-[#F2A93B]/40 text-[#F2A93B]">
                    <Compass className="size-5 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="display-font text-xl font-bold tracking-tight text-[#F7EFE1]">
                        Yatra
                      </h3>
                      <span className="flex size-2 rounded-full bg-[#F2A93B] animate-pulse" />
                    </div>
                    <p className="text-xs text-[#A9B4D4] font-sans">
                      Your India travel companion
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearHistory}
                    title="Clear Conversation"
                    className="flex size-8 items-center justify-center rounded-full text-[#A9B4D4] hover:bg-white/10 hover:text-[#F7EFE1] transition-colors"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>

                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Restore Normal Size" : "Expand Chat"}
                    className="hidden sm:flex size-8 items-center justify-center rounded-full text-[#A9B4D4] hover:bg-white/10 hover:text-[#F7EFE1] transition-colors"
                  >
                    {isExpanded ? (
                      <Minimize2 className="size-3.5" />
                    ) : (
                      <Maximize2 className="size-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                    className="flex size-8 items-center justify-center rounded-full text-[#A9B4D4] hover:bg-white/10 hover:text-[#F7EFE1] transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mood Chips Carousel Bar */}
            <div className="flex items-center gap-2 overflow-x-auto bg-[#F7EFE1] px-4 py-2.5 border-b border-[#ECDFC4] scrollbar-none select-none">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleSendMessage(m.moodPrompt, m.label)}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-[#ECDFC4] bg-[#FBF3E4] px-3 py-1.5 text-xs font-medium text-[#23304C] transition-all hover:border-[#D98A1C] hover:bg-[#FFF3DE] active:scale-95 shadow-2xs"
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scroll-smooth">
              {messages.map((msg) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[86%] space-y-1",
                      isUser ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {/* Sender Label */}
                    <span className="px-1 text-[11px] text-[#5C6785] font-medium">
                      {isUser ? "You" : "Yatra"}
                    </span>

                    {/* Chat Bubble */}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-xs",
                        isUser
                          ? "bg-[#17233D] text-[#F7EFE1] rounded-br-xs"
                          : "bg-[#FBF3E4] border border-[#ECDFC4] border-l-4 border-l-[#8C3B3B] text-[#23304C] rounded-bl-xs"
                      )}
                    >
                      {msg.content}
                    </div>

                    {/* Booking Confirmation Card if present */}
                    {msg.booking && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full mt-2 rounded-2xl border border-[#D98A1C] bg-[#17233D] p-4 text-[#F7EFE1] shadow-xl"
                      >
                        {/* Demo Booking Header Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2A93B] px-2.5 py-0.5 text-[11px] font-bold text-[#101A30]">
                            <Ticket className="size-3" />
                            Booking confirmed (demo)
                          </span>
                          <span className="text-[10px] text-[#A9B4D4] font-mono">
                            Trip Planner
                          </span>
                        </div>

                        {/* Booking Details Table */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-white/10">
                            <span className="text-[#A9B4D4] flex items-center gap-1.5">
                              <MapPin className="size-3 text-[#F2A93B]" /> Destination
                            </span>
                            <span className="font-semibold text-[#F7EFE1] text-right">
                              {msg.booking.destination}
                            </span>
                          </div>

                          <div className="flex justify-between py-1 border-b border-white/10">
                            <span className="text-[#A9B4D4] flex items-center gap-1.5">
                              <Calendar className="size-3 text-[#F2A93B]" /> Dates
                            </span>
                            <span className="font-medium text-[#F7EFE1]">
                              {msg.booking.dates}
                            </span>
                          </div>

                          <div className="flex justify-between py-1 border-b border-white/10">
                            <span className="text-[#A9B4D4] flex items-center gap-1.5">
                              <Users className="size-3 text-[#F2A93B]" /> Travelers
                            </span>
                            <span className="font-medium text-[#F7EFE1]">
                              {String(msg.booking.travelers)}
                            </span>
                          </div>

                          <div className="flex justify-between py-1">
                            <span className="text-[#A9B4D4]">Type</span>
                            <span className="font-medium text-[#F7EFE1]">
                              {msg.booking.type}
                            </span>
                          </div>
                        </div>

                        {/* Reference Code & Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#F2A93B] font-bold tracking-wide">
                              Ref: {msg.booking.reference}
                            </span>
                            <button
                              onClick={() => handleCopyRef(msg.booking!.reference)}
                              title="Copy Reference"
                              className="text-[#A9B4D4] hover:text-[#F2A93B] transition-colors"
                            >
                              {copiedRef === msg.booking.reference ? (
                                <Check className="size-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              handleNavigateDestination(msg.booking!.destination)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F2A93B] hover:underline"
                          >
                            Explore on Atlas <ExternalLink className="size-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}

              {/* Typing Animation Bubble */}
              {isTyping && (
                <div className="flex flex-col max-w-[84%] mr-auto items-start space-y-1">
                  <span className="px-1 text-[11px] text-[#5C6785] font-medium">Yatra</span>
                  <div className="rounded-2xl px-4 py-3 bg-[#FBF3E4] border border-[#ECDFC4] border-l-4 border-l-[#8C3B3B] text-[#23304C] rounded-bl-xs shadow-xs">
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="size-1.5 rounded-full bg-[#5C6785] animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1.5 rounded-full bg-[#5C6785] animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1.5 rounded-full bg-[#5C6785] animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Row */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-[#F7EFE1] p-3 border-t border-[#ECDFC4]"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a place, or say how you're feeling…"
                className="flex-1 rounded-full border border-[#ECDFC4] bg-[#FBF3E4] px-4 py-2.5 text-sm font-sans text-[#23304C] placeholder-[#5C6785] outline-none transition-colors focus:border-[#D98A1C]"
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message to Yatra"
                className="flex size-10 items-center justify-center rounded-full bg-[#F2A93B] text-[#17233D] shadow-md transition-all hover:bg-[#D98A1C] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
