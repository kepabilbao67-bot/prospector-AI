"use client";

import { useEffect, useState } from "react";

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

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram",
  email: "Email", whatsapp: "WhatsApp", tiktok: "TikTok", facebook: "Facebook", other: "Otro",
};

const statusLabels: Record<string, string> = {
  new: "Nuevo", contacted: "Contactado", replied: "Respondido",
  qualified: "Calificado", converted: "Convertido", lost: "Perdido",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ network: "all", status: "all", search: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [aiScore, setAiScore] = useState<{ score: number; reasons: string[]; recommendation: string } | null>(null);

  async function loadContacts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.network !== "all") params.set("network", filters.network);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json();
      setContacts(data.contacts || []);
      setTotal(data.total || 0);
    } catch { setContacts([]); }
    setLoading(false);
  }

  useEffect(() => { loadContacts(); }, [filters]);

  async function scoreContact(contact: Contact) {
    try {
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "score_lead", contact: { firstName: contact.firstName, lastName: contact.lastName, company: contact.company, jobTitle: contact.jobTitle, network: contact.network, status: contact.status } }),
      });
      setAiScore(await res.json());
    } catch { setAiScore(null); }
  }

  async function addContact(formData: FormData) {
    await fetch("/api/contacts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: formData.get("firstName"), lastName: formData.get("lastName"), email: formData.get("email"), company: formData.get("company"), jobTitle: formData.get("jobTitle"), network: formData.get("network"), profileUrl: formData.get("profileUrl") }),
    });
    setShowAdd(false);
    loadContacts();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Contactos</h1>
          <p className="text-xs text-gray-500">{total} registros</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
          Añadir contacto
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-2">
        <input type="text" placeholder="Buscar por nombre, empresa..."
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["all", "linkedin", "fiverr", "twitter", "instagram", "email"].map((n) => (
            <button key={n} onClick={() => setFilters({ ...filters, network: n })}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filters.network === n ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {n === "all" ? "Todos" : networkLabels[n]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">No se encontraron contactos</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-3">Contacto</div>
            <div className="col-span-3">Empresa</div>
            <div className="col-span-2">Red</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2">Score</div>
          </div>
          <div className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <button key={contact.id} onClick={() => { setSelected(contact); scoreContact(contact); }}
                className="w-full px-4 py-3 flex items-center gap-3 md:grid md:grid-cols-12 md:gap-2 hover:bg-gray-50 transition-colors text-left">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 md:col-span-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-medium text-gray-600 shrink-0">
                    {contact.firstName[0]}{contact.lastName?.[0] || ""}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.firstName} {contact.lastName}</p>
                    <p className="text-[11px] text-gray-500 truncate md:hidden">{contact.company}</p>
                  </div>
                </div>
                {/* Company - desktop */}
                <div className="hidden md:block md:col-span-3">
                  <p className="text-sm text-gray-700 truncate">{contact.company || "—"}</p>
                  <p className="text-[11px] text-gray-400 truncate">{contact.jobTitle}</p>
                </div>
                {/* Network */}
                <div className="hidden md:block md:col-span-2">
                  <span className="text-xs text-gray-600">{networkLabels[contact.network]}</span>
                </div>
                {/* Status */}
                <div className="md:col-span-2 ml-auto md:ml-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    contact.status === "converted" ? "bg-green-50 text-green-700" :
                    contact.status === "replied" ? "bg-blue-50 text-blue-700" :
                    contact.status === "qualified" ? "bg-purple-50 text-purple-700" :
                    contact.status === "contacted" ? "bg-yellow-50 text-yellow-700" :
                    "bg-gray-50 text-gray-600"
                  }`}>{statusLabels[contact.status] || contact.status}</span>
                </div>
                {/* Score - desktop */}
                <div className="hidden md:flex md:col-span-2 items-center gap-2">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-700 rounded-full" style={{ width: `${contact.score}%` }} />
                  </div>
                  <span className="text-[11px] text-gray-500">{contact.score}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {selected.firstName[0]}{selected.lastName?.[0] || ""}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selected.firstName} {selected.lastName}</p>
                  <p className="text-xs text-gray-500">{selected.jobTitle} · {selected.company}</p>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setAiScore(null); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {/* AI Score */}
            {aiScore && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-700">Lead Score (IA)</p>
                  <span className="text-lg font-semibold text-gray-900">{aiScore.score}/100</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${aiScore.score >= 70 ? "bg-green-500" : aiScore.score >= 40 ? "bg-yellow-500" : "bg-gray-400"}`} style={{ width: `${aiScore.score}%` }} />
                </div>
                <p className="text-xs text-gray-600 mb-2">{aiScore.recommendation}</p>
                <div className="space-y-0.5">
                  {aiScore.reasons.map((r, i) => <p key={i} className="text-[11px] text-gray-500">· {r}</p>)}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900">{selected.email || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Red</span>
                <span className="text-gray-900">{networkLabels[selected.network]}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Estado</span>
                <span className="text-gray-900">{statusLabels[selected.status] || selected.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="py-2.5 bg-gray-900 text-white rounded-lg text-xs font-medium">Enviar mensaje IA</button>
              <button className="py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">Añadir a campaña</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Nuevo contacto</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addContact(new FormData(e.currentTarget)); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input name="firstName" required placeholder="Nombre" className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                <input name="lastName" placeholder="Apellido" className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <div className="grid grid-cols-2 gap-2">
                <input name="company" placeholder="Empresa" className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                <input name="jobTitle" placeholder="Cargo" className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <select name="network" required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900">
                <option value="linkedin">LinkedIn</option>
                <option value="fiverr">Fiverr</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="other">Otro</option>
              </select>
              <input name="profileUrl" placeholder="URL del perfil" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <button type="submit" className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
