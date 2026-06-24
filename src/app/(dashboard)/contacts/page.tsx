"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getNetworkIcon } from "@/lib/utils";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  company: string | null;
  jobTitle: string | null;
  network: string;
  tags: string;
  status: string;
  score: number;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ network: "all", status: "all", search: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [aiScore, setAiScore] = useState<{ score: number; reasons: string[]; recommendation: string } | null>(null);

  async function loadContacts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.network !== "all") params.set("network", filters.network);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);

    const res = await fetch(`/api/contacts?${params.toString()}`);
    const data = await res.json();
    setContacts(data.contacts || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { loadContacts(); }, [filters]);

  async function scoreContact(contact: Contact) {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "score_lead",
        contact: { firstName: contact.firstName, lastName: contact.lastName, company: contact.company, jobTitle: contact.jobTitle, network: contact.network, status: contact.status },
      }),
    });
    const data = await res.json();
    setAiScore(data);
  }

  async function addContact(formData: FormData) {
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        company: formData.get("company"),
        jobTitle: formData.get("jobTitle"),
        network: formData.get("network"),
        profileUrl: formData.get("profileUrl"),
      }),
    });
    setShowAdd(false);
    loadContacts();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Contactos</h1>
          <p className="text-xs text-gray-500">{total} leads en tu CRM</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>+ Añadir</Button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Buscar contactos..."
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Filters - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["all", "linkedin", "fiverr", "twitter", "instagram", "email"].map((n) => (
          <button
            key={n}
            onClick={() => setFilters({ ...filters, network: n })}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              filters.network === n ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {n === "all" ? "Todos" : `${getNetworkIcon(n)} ${n}`}
          </button>
        ))}
      </div>

      {/* Contact cards - mobile optimized */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm text-gray-500">No se encontraron contactos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => { setSelectedContact(contact); scoreContact(contact); }}
              className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {contact.firstName[0]}{contact.lastName?.[0] || ""}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{contact.firstName} {contact.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{contact.jobTitle} {contact.company ? `@ ${contact.company}` : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{getNetworkIcon(contact.network)}</span>
                <Badge variant={getStatusColor(contact.status)}>{contact.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Detail with AI Score */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {selectedContact.firstName[0]}{selectedContact.lastName?.[0] || ""}
                </div>
                <div>
                  <h2 className="font-bold">{selectedContact.firstName} {selectedContact.lastName}</h2>
                  <p className="text-xs text-gray-500">{selectedContact.jobTitle} @ {selectedContact.company}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedContact(null); setAiScore(null); }} className="text-gray-400 text-2xl">×</button>
            </div>

            {/* AI Score */}
            {aiScore && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-purple-900">✨ Puntuación IA</p>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-700">{aiScore.score}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-2">{aiScore.recommendation}</p>
                <div className="space-y-1">
                  {aiScore.reasons.map((r, i) => (
                    <p key={i} className="text-xs text-gray-600">• {r}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNetworkIcon(selectedContact.network)}</span>
                <Badge variant={getStatusColor(selectedContact.status)}>{selectedContact.status}</Badge>
                {selectedContact.email && <span className="text-xs text-gray-500">{selectedContact.email}</span>}
              </div>

              <div className="flex flex-wrap gap-1">
                {JSON.parse(selectedContact.tags || "[]").map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="py-3 bg-blue-600 text-white rounded-xl text-sm font-medium active:scale-95">
                💬 Enviar Mensaje IA
              </button>
              <button className="py-3 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium active:scale-95">
                🚀 Añadir a Campaña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Añadir Contacto</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addContact(new FormData(e.currentTarget)); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="firstName" required placeholder="Nombre *" className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
                <input name="lastName" placeholder="Apellido" className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              </div>
              <input name="email" type="email" placeholder="Email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="company" placeholder="Empresa" className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
                <input name="jobTitle" placeholder="Cargo" className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              </div>
              <select name="network" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
                <option value="linkedin">💼 LinkedIn</option>
                <option value="fiverr">🟢 Fiverr</option>
                <option value="twitter">🐦 Twitter</option>
                <option value="instagram">📸 Instagram</option>
                <option value="email">📧 Email</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="facebook">📘 Facebook</option>
              </select>
              <input name="profileUrl" placeholder="URL del perfil" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <Button type="submit" className="w-full py-3">Guardar Contacto</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
