"use client";

import { useState } from "react";

interface Conversation {
  id: string;
  contactName: string;
  network: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar: string;
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram", email: "Email",
};

const demoConversations: Conversation[] = [
  { id: "1", contactName: "Carlos García", network: "linkedin", lastMessage: "Me interesa mucho tu propuesta, ¿podemos hablar esta semana?", timestamp: "5 min", unread: true, avatar: "CG" },
  { id: "2", contactName: "buyer_2024", network: "fiverr", lastMessage: "I need a website redesign. Can you do it in 2 weeks?", timestamp: "1h", unread: true, avatar: "B2" },
  { id: "3", contactName: "Ana Martínez", network: "instagram", lastMessage: "Vi tu perfil y me encanta tu trabajo", timestamp: "3h", unread: false, avatar: "AM" },
  { id: "4", contactName: "David Chen", network: "twitter", lastMessage: "Interesting thread! Would love to collaborate.", timestamp: "6h", unread: false, avatar: "DC" },
  { id: "5", contactName: "Laura Fernández", network: "email", lastMessage: "Re: Propuesta de colaboración - Perfecto, te paso el brief esta tarde.", timestamp: "Ayer", unread: false, avatar: "LF" },
  { id: "6", contactName: "proyecto_web_2024", network: "fiverr", lastMessage: "Your proposal looks great. Let me discuss with my team.", timestamp: "Ayer", unread: false, avatar: "PW" },
  { id: "7", contactName: "Miguel Torres", network: "linkedin", lastMessage: "Gracias por la información. La revisaré con mi equipo.", timestamp: "2 días", unread: false, avatar: "MT" },
];

export default function InboxPage() {
  const [conversations] = useState<Conversation[]>(demoConversations);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [replyText, setReplyText] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const filtered = filter === "all" ? conversations : conversations.filter(c => c.network === filter);
  const unreadCount = conversations.filter(c => c.unread).length;

  async function generateAIReply() {
    if (!activeConv) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_message",
          context: { contact: { firstName: activeConv.contactName.split(" ")[0], network: activeConv.network }, tone: "professional", language: "es", messageType: "follow_up" },
        }),
      });
      const data = await res.json();
      setAiSuggestion(data.message);
    } catch { setAiSuggestion(""); }
    setLoadingAI(false);
  }

  // Chat view
  if (activeConv) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] -m-4 md:-m-8">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setActiveConv(null)} className="text-gray-400 hover:text-gray-600 md:hidden">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{activeConv.avatar}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{activeConv.contactName}</p>
            <p className="text-[11px] text-gray-500">{networkLabels[activeConv.network]}</p>
          </div>
          <button onClick={generateAIReply} disabled={loadingAI} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 transition-colors disabled:opacity-50">
            {loadingAI ? "..." : "Sugerir respuesta"}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800">{activeConv.lastMessage}</p>
              <p className="text-[10px] text-gray-400 mt-1.5">{activeConv.timestamp}</p>
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-medium text-gray-500">Sugerencia IA</p>
              <button onClick={() => setAiSuggestion("")} className="text-[11px] text-gray-400 hover:text-gray-600">Cerrar</button>
            </div>
            <p className="text-xs text-gray-700 mb-2">{aiSuggestion}</p>
            <button onClick={() => { setReplyText(aiSuggestion); setAiSuggestion(""); }} className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-[11px] font-medium">
              Usar este mensaje
            </button>
          </div>
        )}

        {/* Reply */}
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Escribe un mensaje..."
              className="flex-1 px-3.5 py-2.5 bg-gray-100 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none" />
            <button className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium shrink-0">Enviar</button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
          {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} sin leer</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: "all", label: "Todos" },
          { id: "linkedin", label: "LinkedIn" },
          { id: "fiverr", label: "Fiverr" },
          { id: "instagram", label: "Instagram" },
          { id: "twitter", label: "Twitter" },
          { id: "email", label: "Email" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Conversations */}
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
        {filtered.map((conv) => (
          <button key={conv.id} onClick={() => setActiveConv(conv)}
            className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors hover:bg-gray-50 ${conv.unread ? "bg-blue-50/50" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">{conv.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${conv.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{conv.contactName}</p>
                <span className="text-[10px] text-gray-400 shrink-0 ml-2">{conv.timestamp}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400">{networkLabels[conv.network]}</span>
                <span className="text-gray-300">·</span>
                <p className={`text-xs truncate ${conv.unread ? "text-gray-700" : "text-gray-500"}`}>{conv.lastMessage}</p>
              </div>
            </div>
            {conv.unread && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
