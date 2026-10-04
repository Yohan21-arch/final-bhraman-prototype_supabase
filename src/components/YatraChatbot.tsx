import { createPortal } from "react-dom";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  X,
  Send,
  Compass,
  MapPin,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Place, StateData } from "@/types";
import { getLoadedPlaces } from "@/data/places";
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
  contextPlace?: Place | null;
}

export function YatraChatbot({
  onSelectPlace,
  onSelectState,
  initialPrompt,
  onClearInitialPrompt,
  places, contextPlace,
}: YatraChatbotProps) {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
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
        "Namaste. I'm Yatra, your India travel companion. Tell me what draws you to a place, and we'll shape a journey around it.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const dialogRef = useDialogFocus(isOpen, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduceMotion ? "instant" : "smooth" });
  }, [isOpen, messages, isTyping, reduceMotion]);

  // Handle external trigger prompts (e.g. from Place details or State guide)
  useEffect(() => {
    if (initialPrompt && !isTyping) {
      setIsOpen(true);
      handleSendMessage(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt, isTyping]);

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

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || sendingRef.current) return;
    sendingRef.current = true;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: userText,
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
      sendingRef.current = false;
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
          "Namaste. I'm Yatra, your India travel companion. Tell me what draws you to a place, and we'll shape a journey around it.",
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
      setIsOpen(false);
      onSelectPlace(matchedPlace);
      return;
    }
    const matchedState = STATES_DATA.find(
      (s) => s.name.toLowerCase().includes(term) || term.includes(s.name.toLowerCase())
    );
    if (matchedState && onSelectState) {
      setIsOpen(false);
      onSelectState(matchedState);
    }
  };

  return <>
    {!isOpen && <button id="yatra-launcher-btn" className="yatra-launcher" aria-label="Open Yatra India Travel Chatbot" onClick={() => setIsOpen(true)}><Compass className="size-5" /><span>Ask Yatra</span></button>}
    {isOpen && createPortal(<div className="yatra-layer">
      <div className="yatra-backdrop" aria-hidden="true" onClick={() => setIsOpen(false)} />
      <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="yatra-title" tabIndex={-1}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .2 }}
        className={cn("yatra-panel", isExpanded && "is-expanded")}>
        <header className="yatra-header"><div className="flex items-center gap-3 min-w-0"><Compass className="size-6 text-primary shrink-0" /><div><p className="eyebrow text-primary">Bhraman travel companion</p><h2 id="yatra-title" className="display-font">Yatra</h2></div></div>
          <div className="flex"><button disabled={isTyping} onClick={handleClearHistory} aria-label="Start a new conversation" title="Start a new conversation"><RotateCcw className="size-4" /></button><button className="yatra-expand" onClick={() => setIsExpanded(!isExpanded)} aria-label={isExpanded ? "Restore chat size" : "Expand chat"}>{isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button><button data-dialog-autofocus onClick={() => setIsOpen(false)} aria-label="Minimize Yatra" title="Your conversation stays here"><X className="size-5" /></button></div>
        </header>
        {contextPlace && <div className="yatra-context"><MapPin className="size-4 shrink-0" /><span>Exploring {contextPlace.name}</span><button disabled={isTyping} onClick={() => handleSendMessage("Help me plan a visit to " + contextPlace.name + ". Ask about my dates, interests and starting city.")}>Plan a visit</button></div>}
        <div className="yatra-messages" ref={scrollRef} role="log" aria-label="Conversation with Yatra" aria-live="polite" aria-relevant="additions text" aria-busy={isTyping}>
          {messages.map(msg => <article key={msg.id} className={cn("yatra-message", msg.role === "user" && "is-user")}><p className="yatra-sender">{msg.role === "user" ? "You" : "Yatra"}</p><div className="yatra-bubble">{msg.content}</div>
            {msg.booking && <div className="yatra-booking"><p className="eyebrow text-primary">Illustrative booking · demo</p><h3 className="display-font">{msg.booking.destination}</h3><dl><div><dt>Dates</dt><dd>{msg.booking.dates}</dd></div><div><dt>Travellers</dt><dd>{msg.booking.travelers}</dd></div><div><dt>Experience</dt><dd>{msg.booking.type}</dd></div></dl><p className="text-xs text-muted-foreground">Planning reference only. No payment, reservation or ticket is issued.</p><div className="flex flex-wrap items-center gap-2"><span className="text-xs">Ref: {msg.booking.reference}</span><button aria-label="Copy booking reference" onClick={() => handleCopyRef(msg.booking!.reference)}>{copiedRef === msg.booking.reference ? <Check className="size-4" /> : <Copy className="size-4" />}</button><button onClick={() => handleNavigateDestination(msg.booking!.destination)}>Explore on Atlas <ChevronRight className="size-4" /></button></div></div>}
          </article>)}
          {isTyping && <p className="yatra-thinking" role="status"><span className="yatra-thinking-dot" />Yatra is considering your journey…</p>}
          <div ref={messagesEndRef} />
        </div>
        <div className="yatra-suggestions" aria-label="Suggested travel prompts">{messages.length === 1 && <p className="eyebrow text-muted-foreground">What kind of journey?</p>}<div>{MOODS.map(m => <button key={m.label} disabled={isTyping} onClick={() => handleSendMessage(m.moodPrompt)}>{m.emoji} {m.label}</button>)}</div></div>
        <form onSubmit={handleSubmit} className="yatra-composer"><label htmlFor="yatra-message" className="sr-only">Message Yatra</label><div><textarea id="yatra-message" ref={inputRef} rows={2} value={input} onChange={e => setInput(e.target.value)} placeholder="Where would you like to go?" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (!isTyping) handleSubmit(e); } }} /><button type="submit" disabled={!input.trim() || isTyping} aria-label="Send message to Yatra"><Send className="size-4" /></button></div><p>AI travel guidance · Check current details before travelling.</p></form>
      </motion.div>
    </div>, document.body)}
  </>;
}

