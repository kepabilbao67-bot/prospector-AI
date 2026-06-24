// ProspectorAI Smart Engine - Advanced automation logic
// Auto-responder, A/B testing, smart scheduling, follow-up sequences, blacklist

// ============ SMART AUTO-RESPONDER ============

export interface AutoResponderRule {
  id: string;
  trigger: "any_reply" | "positive_reply" | "question" | "objection" | "not_interested";
  network: string; // "all" or specific network
  action: "reply" | "notify" | "move_to_stage" | "tag";
  replyTemplate?: string;
  isActive: boolean;
}

// Analyze incoming message sentiment/intent
export function analyzeIncomingMessage(message: string): {
  intent: "positive" | "negative" | "question" | "objection" | "neutral";
  confidence: number;
  suggestedAction: string;
  keywords: string[];
} {
  const lower = message.toLowerCase();

  // Positive signals
  const positiveWords = ["interesa", "cuéntame", "sí", "claro", "perfecto", "genial", "me gusta", "avancemos", "hablemos", "precio", "presupuesto", "cuánto", "yes", "sure", "interested", "tell me more", "sounds good", "let's talk"];
  const positiveMatch = positiveWords.filter(w => lower.includes(w));

  // Negative signals
  const negativeWords = ["no gracias", "no me interesa", "no necesito", "deja de", "spam", "no thanks", "not interested", "stop", "unsubscribe", "remove me"];
  const negativeMatch = negativeWords.filter(w => lower.includes(w));

  // Question signals
  const questionWords = ["?", "cómo", "cuándo", "dónde", "qué incluye", "cuánto cuesta", "how", "what", "when", "where", "how much"];
  const questionMatch = questionWords.filter(w => lower.includes(w));

  // Objection signals
  const objectionWords = ["caro", "no tengo tiempo", "más adelante", "expensive", "busy", "later", "maybe next", "not now", "pensarlo"];
  const objectionMatch = objectionWords.filter(w => lower.includes(w));

  let intent: "positive" | "negative" | "question" | "objection" | "neutral" = "neutral";
  let confidence = 50;
  let suggestedAction = "Revisar manualmente";

  if (negativeMatch.length > 0) {
    intent = "negative";
    confidence = 85;
    suggestedAction = "Marcar como 'No interesado' y detener secuencia";
  } else if (positiveMatch.length >= 2) {
    intent = "positive";
    confidence = 90;
    suggestedAction = "🔥 Responder inmediatamente con propuesta";
  } else if (positiveMatch.length === 1) {
    intent = "positive";
    confidence = 70;
    suggestedAction = "Responder con más información";
  } else if (questionMatch.length > 0) {
    intent = "question";
    confidence = 80;
    suggestedAction = "Responder la pregunta y guiar hacia propuesta";
  } else if (objectionMatch.length > 0) {
    intent = "objection";
    confidence = 75;
    suggestedAction = "Manejar objeción con respuesta empática";
  }

  return {
    intent,
    confidence,
    suggestedAction,
    keywords: [...positiveMatch, ...negativeMatch, ...questionMatch, ...objectionMatch],
  };
}

// Generate auto-response based on intent
export function generateAutoResponse(intent: string, contactName: string, originalMessage: string): string {
  const responses: Record<string, string[]> = {
    positive: [
      `¡Genial ${contactName}! Me alegra que te interese. Te cuento rápidamente cómo podemos avanzar...`,
      `¡Perfecto ${contactName}! Veo que esto encaja con lo que buscas. ¿Te parece si agendamos una llamada de 15 min para ver los detalles?`,
      `${contactName}, me encanta tu respuesta. Te preparo una propuesta personalizada ahora mismo. ¿Qué horario te viene mejor para revisarla juntos?`,
    ],
    question: [
      `Buena pregunta ${contactName}. Te respondo encantado...`,
      `${contactName}, gracias por preguntar. Aquí te va la info...`,
    ],
    objection: [
      `Entiendo perfectamente ${contactName}. Sin compromiso, ¿te parece si te envío un caso de éxito de alguien en tu misma situación? Solo te tomará 1 min leerlo.`,
      `${contactName}, lo entiendo al 100%. Muchos de mis clientes pensaban lo mismo antes de ver los resultados. ¿Te cuento un caso rápido?`,
      `Sin presión ${contactName}. Te dejo un recurso gratuito que puede servirte mientras tanto. Cuando estés listo, aquí estaré.`,
    ],
    negative: [
      `Entendido ${contactName}, sin problema. Te deseo mucho éxito. Si en el futuro necesitas algo, aquí estaré.`,
    ],
    neutral: [
      `Gracias por tu mensaje ${contactName}. ¿Hay algo específico en lo que pueda ayudarte?`,
    ],
  };

  const templates = responses[intent] || responses.neutral;
  return templates[Math.floor(Math.random() * templates.length)];
}

// ============ A/B TESTING ENGINE ============

export interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  status: "running" | "completed" | "paused";
  winnerIndex: number | null;
  totalSent: number;
  startedAt: string;
}

export interface ABVariant {
  id: string;
  name: string;
  content: string;
  sent: number;
  replies: number;
  conversions: number;
  replyRate: number;
}

export function calculateABWinner(variants: ABVariant[]): {
  winnerIndex: number;
  confidence: number;
  improvement: string;
  recommendation: string;
} {
  if (variants.length < 2) return { winnerIndex: 0, confidence: 0, improvement: "0%", recommendation: "Necesitas al menos 2 variantes" };

  // Calculate reply rates
  const rates = variants.map(v => v.sent > 0 ? (v.replies / v.sent) * 100 : 0);
  const maxRate = Math.max(...rates);
  const winnerIndex = rates.indexOf(maxRate);
  const loserRate = Math.min(...rates.filter(r => r > 0));

  // Simple confidence based on sample size
  const totalSent = variants.reduce((sum, v) => sum + v.sent, 0);
  let confidence = Math.min(totalSent * 2, 95); // More sends = more confidence
  if (totalSent < 20) confidence = Math.min(confidence, 60);

  const improvement = loserRate > 0 ? `+${((maxRate - loserRate) / loserRate * 100).toFixed(0)}%` : "N/A";

  let recommendation = "";
  if (confidence >= 80 && totalSent >= 50) {
    recommendation = `✅ Variante "${variants[winnerIndex].name}" es la ganadora. Usar en toda la campaña.`;
  } else if (confidence >= 60) {
    recommendation = `🟡 Tendencia a favor de "${variants[winnerIndex].name}" pero necesitas más datos (mín 50 envíos).`;
  } else {
    recommendation = `⚪ Aún no hay datos suficientes. Sigue enviando.`;
  }

  return { winnerIndex, confidence, improvement, recommendation };
}

// ============ SMART SCHEDULER ============

export interface SmartSchedule {
  bestHours: number[];
  bestDays: string[];
  timezone: string;
  reason: string;
}

export function getOptimalSchedule(network: string, targetTimezone?: string): SmartSchedule {
  // Optimal engagement times by network (based on industry data)
  const schedules: Record<string, SmartSchedule> = {
    linkedin: {
      bestHours: [8, 9, 10, 12, 17, 18],
      bestDays: ["martes", "miércoles", "jueves"],
      timezone: targetTimezone || "Europe/Madrid",
      reason: "LinkedIn tiene mayor engagement en horario laboral, especialmente martes-jueves entre 8-10h y 17-18h",
    },
    fiverr: {
      bestHours: [9, 10, 11, 14, 15, 16, 20, 21],
      bestDays: ["lunes", "martes", "miércoles", "jueves", "viernes"],
      timezone: targetTimezone || "America/New_York",
      reason: "Fiverr es global pero la mayoría de compradores están en US. Envía propuestas cuando empiezan su día laboral",
    },
    instagram: {
      bestHours: [11, 12, 13, 19, 20, 21],
      bestDays: ["miércoles", "viernes", "sábado"],
      timezone: targetTimezone || "Europe/Madrid",
      reason: "Instagram tiene picos al mediodía y por la noche. Los fines de semana también funcionan bien",
    },
    twitter: {
      bestHours: [8, 9, 12, 13, 17, 18],
      bestDays: ["lunes", "martes", "miércoles", "jueves"],
      timezone: targetTimezone || "America/New_York",
      reason: "Twitter funciona mejor en horario laboral US, especialmente durante breaks y commute",
    },
    email: {
      bestHours: [6, 7, 8, 10, 14],
      bestDays: ["martes", "miércoles", "jueves"],
      timezone: targetTimezone || "Europe/Madrid",
      reason: "Emails temprano (6-8h) o a media mañana (10h) tienen mayor tasa de apertura. Martes es el mejor día",
    },
    whatsapp: {
      bestHours: [9, 10, 11, 15, 16, 17],
      bestDays: ["lunes", "martes", "miércoles", "jueves", "viernes"],
      timezone: targetTimezone || "Europe/Madrid",
      reason: "WhatsApp es personal. Envía en horario razonable, nunca muy temprano ni muy tarde",
    },
    tiktok: {
      bestHours: [12, 15, 19, 20, 21, 22],
      bestDays: ["jueves", "viernes", "sábado"],
      timezone: targetTimezone || "Europe/Madrid",
      reason: "TikTok tiene engagement máximo por la tarde-noche y fines de semana",
    },
    facebook: {
      bestHours: [9, 10, 11, 13, 14, 19, 20],
      bestDays: ["miércoles", "jueves", "viernes"],
      timezone: targetTimezone || "Europe/Madrid",
      reason: "Facebook funciona bien a media mañana y después del trabajo",
    },
  };

  return schedules[network] || schedules.email;
}

// Calculate next optimal send time
export function getNextOptimalTime(network: string): Date {
  const schedule = getOptimalSchedule(network);
  const now = new Date();
  const currentHour = now.getHours();

  // Find next best hour
  const nextHour = schedule.bestHours.find(h => h > currentHour) || schedule.bestHours[0];
  const nextTime = new Date(now);

  if (nextHour <= currentHour) {
    // Move to next day
    nextTime.setDate(nextTime.getDate() + 1);
  }

  nextTime.setHours(nextHour, Math.floor(Math.random() * 30) + 5, 0, 0); // Random minutes 5-35
  return nextTime;
}

// ============ SMART FOLLOW-UP ENGINE ============

export interface FollowUpStrategy {
  attempts: { delayDays: number; approach: string; toneShift: string }[];
  maxAttempts: number;
  stopConditions: string[];
}

export function getFollowUpStrategy(network: string, previousAttempts: number): FollowUpStrategy {
  const strategies: Record<string, FollowUpStrategy> = {
    linkedin: {
      maxAttempts: 4,
      attempts: [
        { delayDays: 3, approach: "Valor añadido - compartir recurso útil", toneShift: "helpful" },
        { delayDays: 5, approach: "Caso de éxito relevante", toneShift: "proof" },
        { delayDays: 7, approach: "Pregunta directa simple", toneShift: "direct" },
        { delayDays: 14, approach: "Último intento - oferta especial o break-up email", toneShift: "final" },
      ],
      stopConditions: ["reply_received", "connection_rejected", "profile_blocked", "max_attempts"],
    },
    fiverr: {
      maxAttempts: 3,
      attempts: [
        { delayDays: 2, approach: "Recordatorio amable con valor extra", toneShift: "helpful" },
        { delayDays: 4, approach: "Descuento o bonus exclusivo", toneShift: "incentive" },
        { delayDays: 7, approach: "Último mensaje - sin presión", toneShift: "final" },
      ],
      stopConditions: ["reply_received", "project_closed", "max_attempts"],
    },
    email: {
      maxAttempts: 5,
      attempts: [
        { delayDays: 2, approach: "Bump breve - ¿viste mi email anterior?", toneShift: "brief" },
        { delayDays: 4, approach: "Nuevo ángulo - diferente beneficio", toneShift: "reframe" },
        { delayDays: 7, approach: "Social proof - testimonios", toneShift: "proof" },
        { delayDays: 10, approach: "Oferta por tiempo limitado", toneShift: "urgency" },
        { delayDays: 14, approach: "Break-up email (curiosidad)", toneShift: "final" },
      ],
      stopConditions: ["reply_received", "unsubscribed", "bounced", "max_attempts"],
    },
  };

  return strategies[network] || strategies.email;
}

// ============ BLACKLIST & ANTI-SPAM ============

export interface BlacklistEntry {
  pattern: string; // email, domain, name pattern, keyword
  type: "email" | "domain" | "keyword" | "network_id";
  reason: string;
  addedAt: string;
}

const DEFAULT_BLACKLIST_PATTERNS: string[] = [
  // Common do-not-contact indicators
  "noreply", "no-reply", "donotreply", "unsubscribe",
  "support@", "info@", "admin@", "webmaster@",
  // Competitors (customize)
  // Spam-trap patterns
  "test@", "example@", "foo@", "bar@",
];

export function checkBlacklist(
  contact: { email?: string; networkId?: string; company?: string; firstName?: string },
  customBlacklist: BlacklistEntry[] = []
): { isBlacklisted: boolean; reason: string } {
  // Check default patterns
  if (contact.email) {
    const emailLower = contact.email.toLowerCase();
    for (const pattern of DEFAULT_BLACKLIST_PATTERNS) {
      if (emailLower.includes(pattern)) {
        return { isBlacklisted: true, reason: `Email matches pattern: ${pattern}` };
      }
    }
  }

  // Check custom blacklist
  for (const entry of customBlacklist) {
    switch (entry.type) {
      case "email":
        if (contact.email?.toLowerCase().includes(entry.pattern.toLowerCase())) {
          return { isBlacklisted: true, reason: entry.reason };
        }
        break;
      case "domain":
        if (contact.email?.toLowerCase().includes(`@${entry.pattern.toLowerCase()}`)) {
          return { isBlacklisted: true, reason: entry.reason };
        }
        break;
      case "keyword":
        const fullName = `${contact.firstName || ""} ${contact.company || ""}`.toLowerCase();
        if (fullName.includes(entry.pattern.toLowerCase())) {
          return { isBlacklisted: true, reason: entry.reason };
        }
        break;
      case "network_id":
        if (contact.networkId === entry.pattern) {
          return { isBlacklisted: true, reason: entry.reason };
        }
        break;
    }
  }

  return { isBlacklisted: false, reason: "" };
}

// ============ REVENUE TRACKING ============

export interface RevenueEntry {
  id: string;
  contactId: string;
  campaignId?: string;
  network: string;
  amount: number;
  currency: string;
  type: "one_time" | "recurring" | "upsell";
  description: string;
  closedAt: string;
}

export function calculateRevenueMetrics(entries: RevenueEntry[]): {
  totalRevenue: number;
  monthlyRecurring: number;
  avgDealSize: number;
  revenueByNetwork: Record<string, number>;
  revenueByCampaign: Record<string, number>;
  roi: number;
  bestNetwork: string;
  trend: "up" | "down" | "stable";
} {
  const totalRevenue = entries.reduce((sum, e) => sum + e.amount, 0);
  const recurringEntries = entries.filter(e => e.type === "recurring");
  const monthlyRecurring = recurringEntries.reduce((sum, e) => sum + e.amount, 0);
  const avgDealSize = entries.length > 0 ? totalRevenue / entries.length : 0;

  const revenueByNetwork: Record<string, number> = {};
  const revenueByCampaign: Record<string, number> = {};

  entries.forEach(e => {
    revenueByNetwork[e.network] = (revenueByNetwork[e.network] || 0) + e.amount;
    if (e.campaignId) {
      revenueByCampaign[e.campaignId] = (revenueByCampaign[e.campaignId] || 0) + e.amount;
    }
  });

  const bestNetwork = Object.entries(revenueByNetwork).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";

  // Simple ROI calculation (assuming ~50€/month tool cost)
  const toolCost = 50;
  const roi = toolCost > 0 ? ((totalRevenue - toolCost) / toolCost) * 100 : 0;

  // Trend based on last 30 days vs previous 30
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const recentRevenue = entries.filter(e => now - new Date(e.closedAt).getTime() < thirtyDays).reduce((s, e) => s + e.amount, 0);
  const previousRevenue = entries.filter(e => {
    const diff = now - new Date(e.closedAt).getTime();
    return diff >= thirtyDays && diff < thirtyDays * 2;
  }).reduce((s, e) => s + e.amount, 0);

  const trend = recentRevenue > previousRevenue * 1.1 ? "up" : recentRevenue < previousRevenue * 0.9 ? "down" : "stable";

  return { totalRevenue, monthlyRecurring, avgDealSize, revenueByNetwork, revenueByCampaign, roi, bestNetwork, trend };
}

// ============ CSV IMPORT PARSER ============

export function parseCSVContacts(csvContent: string): {
  contacts: Record<string, string>[];
  errors: string[];
  columns: string[];
} {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return { contacts: [], errors: ["CSV vacío o sin datos"], columns: [] };

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const contacts: Record<string, string>[] = [];
  const errors: string[] = [];

  // Map common column names
  const columnMap: Record<string, string> = {
    "first name": "firstName", "firstname": "firstName", "nombre": "firstName", "first_name": "firstName",
    "last name": "lastName", "lastname": "lastName", "apellido": "lastName", "last_name": "lastName",
    "email": "email", "correo": "email", "e-mail": "email",
    "company": "company", "empresa": "company", "organization": "company",
    "title": "jobTitle", "job title": "jobTitle", "cargo": "jobTitle", "position": "jobTitle",
    "phone": "phone", "teléfono": "phone", "tel": "phone",
    "linkedin": "profileUrl", "linkedin url": "profileUrl", "profile url": "profileUrl", "url": "profileUrl",
    "network": "network", "red": "network", "source": "network",
    "notes": "notes", "notas": "notes",
    "tags": "tags", "etiquetas": "tags",
  };

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
      const contact: Record<string, string> = {};

      headers.forEach((header, index) => {
        const mappedField = columnMap[header] || header;
        if (values[index]) {
          contact[mappedField] = values[index];
        }
      });

      if (contact.firstName || contact.email) {
        contacts.push(contact);
      } else {
        errors.push(`Fila ${i + 1}: sin nombre ni email`);
      }
    } catch (e) {
      errors.push(`Fila ${i + 1}: formato inválido`);
    }
  }

  return { contacts, errors, columns: headers };
}
