import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  ChevronDown,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import axios from "axios";
import { header, server } from "../config/config.js";

// Replace with your actual Gemini service:
// import { askGemini } from "./geminiService";

const SUGGESTIONS = [
  "How can I track my monthly expenses?",
  "How does AI help me save money?",
  "Can AI analyze my spending habits?",
];

export default function AIAvatarWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showTeaser, setShowTeaser] = useState(true);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "model",
      text: "Hey! 👋 I'm Your AI assistant. Ask me about his work, projects, or anything else!",
      createdAt: new Date(),
    },
  ]);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { description: "" },
  });

  // Prevents the open-flicker by letting the entrance transition settle before scrolling
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, loading]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setHasUnread(false);
    setShowTeaser(false);
  };

  const handleSendMessage = async (formData) => {
    const query = formData?.trim();
    if (!query || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        text: query,
        createdAt: new Date(),
      },
    ]);
    setLoading(true);

    try {
      const responseText = await axios.post(
        `${server}/api/v1/user/ai/general_chat`,
        { description: query },
        header,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: responseText.data.answer,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.log("Error while reaching Gemini:", error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while reaching Gemini.",
      );
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "⚠️ Couldn't reach Gemini. Please try again.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (formData) => {
    reset();
    handleSendMessage(formData.description);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "model",
        text: "Chat cleared. Ask me anything!",
        createdAt: new Date(),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto">
      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            aria-label="AI Chat"
            className="w-[340px] sm:w-[370px] h-[500px] max-h-[80vh] mb-3 flex flex-col overflow-hidden rounded-2xl border border-blue-500/20 bg-[#090d16] shadow-2xl shadow-blue-950/50 text-slate-200 transform-gpu will-change-transform"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent border-b border-blue-500/15">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center ring-pulse shadow-md shadow-blue-500/25">
                  <Bot className="w-5.5 h-5.5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyan-400 rounded-full ring-2 ring-[#090d16]" />
                </div>
                <div className="leading-none">
                  <p className="text-sm font-semibold text-white tracking-tight">
                    Your Assistant
                  </p>
                  <p className="text-[11px] text-blue-300/80 mt-0.5">Online</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearHistory}
                  title="Clear chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-500/10 transition-colors"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-500/10 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 px-3.5 py-3 overflow-y-auto space-y-3 no-scrollbar">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-br-sm shadow-md shadow-blue-900/30"
                          : "bg-white/[0.05] text-slate-200 border border-white/[0.08] rounded-bl-sm"
                      }`}
                    >
                      {isUser ? (
                        msg.text
                      ) : (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 px-1 font-mono">
                      {moment(msg.createdAt).format("h:mm A")}
                    </span>
                  </motion.div>
                );
              })}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 bg-blue-950/40 border border-blue-500/20 text-blue-200 text-xs px-3 py-1.5 rounded-xl w-fit"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Thinking…</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-3 py-2 border-t border-white/[0.05] flex gap-1.5 overflow-x-auto no-scrollbar">
              {SUGGESTIONS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(item)}
                  disabled={loading}
                  className="flex items-center gap-1.5 whitespace-nowrap bg-blue-950/30 hover:bg-blue-900/40 active:scale-95 text-[11px] text-blue-200/80 hover:text-white px-2.5 py-1 rounded-full border border-blue-500/20 transition-all disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  {item}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              className="px-3 py-2.5 border-t border-white/[0.05] flex items-center gap-2"
            >
              <input
                type="text"
                autoComplete="off"
                placeholder="Ask anything…"
                disabled={loading}
                {...register("description", { required: true })}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.07] text-slate-100 text-sm px-3.5 py-2 rounded-full outline-none transition-colors placeholder:text-slate-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shadow-md shadow-blue-500/30 hover:brightness-110"
              >
                <Send className="w-4.5 h-4.5 ml-0.5" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Trigger Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
        className="flex items-center gap-2.5"
      >
        {/* Teaser Bubble */}
        <AnimatePresence>
          {!isOpen && showTeaser && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.92 }}
              transition={{ duration: 0.18 }}
              onClick={toggleChat}
              className="cursor-pointer flex items-center gap-1.5 bg-[#090d16] border border-blue-500/25 text-slate-200 text-xs py-1.5 px-3 rounded-xl shadow-xl hover:border-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Ask me anything 👋</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 ml-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleChat}
          aria-label={isOpen ? "Close Assistant" : "Open Assistant"}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 border border-white/15 outline-none cursor-pointer"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Bot className="w-7 h-7 stroke-[2]" />
              </motion.div>
            )}
          </AnimatePresence>

          {!isOpen && hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-400 border-2 border-[#090d16] rounded-full flex items-center justify-center text-[9px] font-bold text-slate-900 shadow-sm">
              1
            </span>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
