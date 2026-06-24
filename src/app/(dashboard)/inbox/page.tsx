"use client";

import { useState } from "react";
import { getNetworkIcon } from "@/lib/utils";

interface Conversation {
  id: string;
  contactName: string;
  network: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  status: "active" | "waiting" | "closed";
  avatar: string;
}

const demoConversations: Conversation[] = [
  { id: "1", contactName: "Carlos García", network: "linkedin", lastMessage: "Me interesa mucho tu propuesta, ¿podemos hablar esta semana?", timestamp: "Hace 5 min", unread: true, status: "active", avatar: "CG" },
  { id: "2", contactName: "buyer_2024", network: "fiverr", lastMessage: "I need a website redesign. Can you do it in 2 weeks?", timestamp: "Hace 1h", unread: true, status: "active", avatar: "B2" },
  { id: "3", contactName: "Ana Martínez", network: "instagram", lastMessage: "¡Hola! Vi tu perfil y me encanta tu trabajo 😍", timestamp: "Hace 3h", unread: false, status: "waiting", avatar: "AM" },
  { id: "4", contactName: "David Chen", network: "twitter", lastMessage: "Interesting thread! Would love to collaborate.", timestamp: "Hace 6h", unread: false, status: "active", avatar: "DC" },
  { id: "5", contactName: "Laura Fernández", network: "email", lastMessage: "Re: Propuesta de colaboración - Perfecto, te paso el brief esta tarde.", timestamp: "Ayer", unread: false, status: "active", avatar: "LF" },
  { id: "6", contactName: "proyecto_web_2024", network: "fiverr", lastMessage: "Your proposal looks great. Let me discuss with my team.", timestamp: "Ayer", unread: false, status: "waiting", avatar: "PW" },
  { id: "7", contactName: "Miguel Torres", network: "linkedin", lastMessage: "Gracias por la información. La revisaré con mi equipo.", timestamp: "2 días", unread: false, status: "waiting", avatar: "MT" },
];

export default function InboxPage() {
  const [conversations] = useState<Conversation[]>(demoConversations);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [replyText, setReplyText] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const filteredConvs = conversations.filter(
    (c) => filter === "all" || c.network === filter
  );

  const unreadCount = conversations.filter((c) => c.unread).length;

  async function generateAIReply() {
    setShowAI(true);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_message",
        context: {
          contact: {
            firstName: activeConv?.contactName.split(" ")[0] || "",
            lastName: activeConv?.contactName.split(" ")[1] || "",
            network: activeConv?.network || "linkedin",
          },
          tone: "friendly",
          language: "es",
          messageType: "follow_up",
        },
      }),
    });
    const data = await res.json();
    setAiMessage(data.message);
  }

  function useAIMessage() {
    setReplyText(aiMessage);
    setShowAI(false);
  }

  // Mobile: show conversation list or chat
  if (activeConv) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] -m-4 md:-m-8">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setActiveConv(null)} className="text-gray-500 text-lg md:hidden">←</button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {activeConv.avatar}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{activeConv.contactName}</p>
            <div className="flex items-center gap-1">
              <span className="text-sm">{getNetworkIcon(activeConv.network)}</span>
              <span className="text-[10px] text-gray-500 capitalize">{activeConv.network}</span>
            </div>
          </div>
          <button onClick={generateAIReply} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium active:scale-95">
            ✨ IA
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-gray-100">
              <p className="text-sm">{activeConv.lastMessage}</p>
              <p className="text-[10px] text-gray-400 mt-1">{activeConv.timestamp}</p>
            </div>
          </div>
        </div>

        {/* AI suggestion */}
        {showAI && aiMessage && (
          <div className="px-4 py-3 bg-purple-50 border-t border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-purple-700">✨ Sugerencia IA</p>
              <button onClick={() => setShowAI(false)} className="text-xs text-gray-400">✕</button>
            </div>
            <p className="text-sm text-gray-700 mb-2">{aiMessage}</p>
            <button onClick={useAIMessage} className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-xs font-medium active:scale-95">
              Usar este mensaje
            </button>
          </div>
        )}

        {/* Reply input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white active:scale-95 shrink-0">
              ➤
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with unread count */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Inbox</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500">{unreadCount} mensajes sin leer</p>
          )}
        </div>
      </div>

      {/* Network filter - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {[
          { id: "all", label: "Todos", count: conversations.length },
          { id: "linkedin", label: "LinkedIn" },
          { id: "fiverr", label: "Fiverr" },
          { id: "instagram", label: "Instagram" },
          { id: "twitter", label: "Twitter" },
          { id: "email", label: "Email" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
              filter === f.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {f.id !== "all" && <span className="mr-1">{getNetworkIcon(f.id)}</span>}
            {f.label}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="space-y-1">
        {filteredConvs.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConv(conv)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left active:scale-[0.98] transition-all ${
              conv.unread ? "bg-blue-50 border border-blue-100" : "bg-white border border-gray-100"
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {conv.avatar}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 text-sm">{getNetworkIcon(conv.network)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${conv.unread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                  {conv.contactName}
                </p>
                <span className="text-[10px] text-gray-400 shrink-0 ml-2">{conv.timestamp}</span>
              </div>
              <p className={`text-xs truncate mt-0.5 ${conv.unread ? "text-gray-700" : "text-gray-500"}`}>
                {conv.lastMessage}
              </p>
            </div>
            {conv.unread && (
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
