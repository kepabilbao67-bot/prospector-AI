// ProspectorAI - AI Engine for message generation, lead scoring, and campaign optimization
// Uses a built-in AI engine that works WITHOUT external API keys (rule-based + templates)
// Can optionally connect to OpenAI/Claude for enhanced generation

export interface AIContext {
  contact: {
    firstName: string;
    lastName?: string;
    company?: string;
    jobTitle?: string;
    network: string;
    notes?: string;
  };
  campaign?: {
    name: string;
    network: string;
    objective: string;
  };
  product?: {
    name: string;
    description: string;
    price: string;
    benefits: string[];
  };
  tone: "professional" | "casual" | "friendly" | "direct" | "creative";
  language: "es" | "en";
  messageType: "connection" | "first_message" | "follow_up" | "proposal" | "closing" | "cold_email";
}


// Platform-specific character limits and rules
const PLATFORM_RULES: Record<string, { maxChars: number; tips: string[]; avoid: string[] }> = {
  linkedin: {
    maxChars: 300,
    tips: ["Be professional", "Reference mutual connections", "Ask open questions"],
    avoid: ["Links in first message", "Selling immediately", "Generic messages"],
  },
  fiverr: {
    maxChars: 2500,
    tips: ["Show specific expertise", "Reference their project", "Offer quick win"],
    avoid: ["Contact outside platform", "Unrealistic promises", "Spam keywords"],
  },
  twitter: {
    maxChars: 280,
    tips: ["Be concise", "Use hooks", "Reference their tweets"],
    avoid: ["DM spam", "Too many hashtags", "Bot-like messages"],
  },
  instagram: {
    maxChars: 1000,
    tips: ["Be visual", "Use emojis sparingly", "Reference their content"],
    avoid: ["Copy-paste messages", "Too formal", "Immediate selling"],
  },
  email: {
    maxChars: 5000,
    tips: ["Strong subject line", "Personal opening", "Clear CTA"],
    avoid: ["Spam trigger words", "Too long", "No personalization"],
  },
  tiktok: {
    maxChars: 500,
    tips: ["Be trendy", "Use their language", "Reference their content"],
    avoid: ["Too formal", "Long messages", "Hard selling"],
  },
  facebook: {
    maxChars: 2000,
    tips: ["Be friendly", "Find common ground", "Use Messenger features"],
    avoid: ["Adding and messaging instantly", "Generic templates", "Links only"],
  },
  whatsapp: {
    maxChars: 4096,
    tips: ["Be brief", "Use voice notes", "Send at appropriate times"],
    avoid: ["Spam groups", "Too many messages", "Late night messages"],
  },
};


// Message templates by type, tone and language
const MESSAGE_TEMPLATES: Record<string, Record<string, string[]>> = {
  connection_es: {
    professional: [
      "Hola {firstName}, he visto tu trayectoria en {company} y me parece impresionante lo que estás haciendo como {jobTitle}. Me encantaría conectar y compartir ideas sobre {industry}. ¿Te parece bien?",
      "{firstName}, tu perfil me ha llamado la atención. Trabajo en un área complementaria y creo que podríamos generar sinergias interesantes. ¿Conectamos?",
      "Hola {firstName}, coincidimos en el sector y creo que compartimos visión. Me gustaría añadirte a mi red profesional. Un saludo.",
    ],
    casual: [
      "Hey {firstName}! Vi lo que hacéis en {company} y mola mucho. Me gustaría conectar contigo. ¿Qué tal?",
      "¡Hola {firstName}! Tu perfil me ha parecido súper interesante. ¿Te apetece conectar?",
    ],
    friendly: [
      "¡Hola {firstName}! 👋 Me encanta lo que haces en {company}. Me gustaría conectar contigo para intercambiar ideas. ¡Un abrazo!",
      "Hey {firstName}, sigo tu trabajo y me parece genial. ¡Conectemos! 🚀",
    ],
  },
  first_message_es: {
    professional: [
      "Hola {firstName}, gracias por conectar. Vi que en {company} estáis enfocados en [sector]. Trabajo ayudando a empresas como la tuya a {benefit}. ¿Tendrías 10 minutos esta semana para una llamada rápida donde pueda mostrarte cómo?",
      "{firstName}, encantado de estar conectados. He notado que {company} podría beneficiarse de {product}. Sin compromiso, ¿te cuento en 2 minutos cómo funciona?",
    ],
    casual: [
      "¡{firstName}! Gracias por aceptar. Oye, tengo algo que creo que te va a interesar para {company}. ¿Te cuento? No es spam, lo prometo 😄",
      "Hey {firstName}, ahora que estamos conectados... ¿sabías que puedo ayudarte con {benefit}? Dame 5 min y te explico.",
    ],
    direct: [
      "{firstName}, voy al grano: puedo ayudar a {company} a {benefit}. Tengo resultados probados con empresas similares. ¿Hablamos 10 min?",
      "Hola {firstName}. Propuesta directa: {product} para {company}. ROI garantizado. ¿15 min para una demo?",
    ],
  },

  follow_up_es: {
    professional: [
      "Hola {firstName}, te escribí hace unos días sobre {topic}. Entiendo que estés ocupado/a, pero creo que realmente podría interesarte. ¿Hay algún momento mejor para hablar?",
      "{firstName}, solo quería hacer seguimiento. Vi un caso de éxito reciente que aplica perfecto a {company}. ¿Te lo comparto?",
      "Hola {firstName}, no quiero ser insistente pero creo que {product} encaja perfecto con lo que hacéis en {company}. ¿Puedo mandarte un caso práctico de 1 min?",
    ],
    casual: [
      "Hey {firstName}, ¿viste mi mensaje anterior? No quiero ser pesado, solo quería asegurarme de que no se perdió. ¿Hablamos?",
      "{firstName}! Solo paso a saludar y recordarte que sigo aquí para ayudarte con {benefit}. Sin presión 😊",
    ],
  },
  proposal_es: {
    professional: [
      "Hola {firstName},\n\nTras analizar las necesidades de {company}, he preparado una propuesta específica:\n\n📋 Servicio: {product}\n💰 Inversión: {price}\n🎯 Resultado esperado: {benefit}\n⏱️ Plazo: {timeline}\n\n¿Te gustaría revisarla en detalle en una llamada de 15 min?",
      "{firstName}, basándome en nuestra conversación, esto es lo que puedo ofrecerte:\n\n✅ {product}\n✅ {benefit}\n✅ Garantía de satisfacción\n\nPrecio especial por tiempo limitado: {price}\n\n¿Avanzamos?",
    ],
  },
  closing_es: {
    professional: [
      "{firstName}, hemos hablado varias veces y creo que está claro el valor que {product} puede aportar a {company}. ¿Qué te falta para tomar la decisión? Estoy aquí para resolver cualquier duda.",
      "Hola {firstName}, quiero ser transparente: la oferta especial que te comenté vence este viernes. Si hay algo que te frena, dímelo y lo resolvemos. ¿Cerramos?",
    ],
    direct: [
      "{firstName}, última oportunidad: el precio especial de {price} para {product} expira en 48h. Después será el precio estándar. ¿Lo cerramos hoy?",
    ],
  },
  cold_email_es: {
    professional: [
      "Asunto: {firstName}, una idea para {company}\n\nHola {firstName},\n\nSoy [nombre] y ayudo a {jobTitle}s como tú a {benefit}.\n\nHe investigado {company} y veo una oportunidad clara de {opportunity}.\n\nEn los últimos 3 meses, ayudé a [X empresas similares] a conseguir [resultado específico].\n\n¿Tienes 10 minutos para una llamada rápida?\n\nSaludos,\n[firma]",
    ],
  },
};


// AI Message Generator - works WITHOUT external API
export function generateMessage(context: AIContext): { message: string; tips: string[]; confidence: number } {
  const { contact, tone, language, messageType, product } = context;
  const lang = language || "es";
  const templateKey = `${messageType}_${lang}`;
  const toneTemplates = MESSAGE_TEMPLATES[templateKey]?.[tone] || MESSAGE_TEMPLATES[templateKey]?.professional || [];

  if (toneTemplates.length === 0) {
    return { message: "No se encontró template adecuado", tips: [], confidence: 0 };
  }

  // Select random template
  const template = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

  // Replace variables
  let message = template
    .replace(/\{firstName\}/g, contact.firstName || "")
    .replace(/\{lastName\}/g, contact.lastName || "")
    .replace(/\{company\}/g, contact.company || "tu empresa")
    .replace(/\{jobTitle\}/g, contact.jobTitle || "profesional")
    .replace(/\{product\}/g, product?.name || "nuestra solución")
    .replace(/\{price\}/g, product?.price || "consultar")
    .replace(/\{benefit\}/g, product?.benefits?.[0] || "mejorar resultados")
    .replace(/\{industry\}/g, "tu sector")
    .replace(/\{topic\}/g, product?.name || "lo que hablamos")
    .replace(/\{timeline\}/g, "2-4 semanas")
    .replace(/\{opportunity\}/g, "crecimiento")
    .replace(/\{network\}/g, contact.network);

  // Apply platform character limits
  const rules = PLATFORM_RULES[contact.network] || PLATFORM_RULES.email;
  if (message.length > rules.maxChars) {
    message = message.slice(0, rules.maxChars - 3) + "...";
  }

  // Calculate confidence based on how much data we have
  let confidence = 50;
  if (contact.firstName) confidence += 10;
  if (contact.company) confidence += 15;
  if (contact.jobTitle) confidence += 10;
  if (product?.name) confidence += 15;
  confidence = Math.min(confidence, 98);

  return { message, tips: rules.tips, confidence };
}


// Generate multiple message variations
export function generateVariations(context: AIContext, count: number = 3): { messages: string[]; bestIndex: number } {
  const messages: string[] = [];
  const tones: AIContext["tone"][] = ["professional", "casual", "friendly", "direct", "creative"];

  for (let i = 0; i < count; i++) {
    const variation = { ...context, tone: tones[i % tones.length] };
    const result = generateMessage(variation);
    messages.push(result.message);
  }

  return { messages, bestIndex: 0 };
}

// AI Lead Scoring
export function calculateLeadScore(contact: {
  firstName: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  network: string;
  status: string;
  notes?: string;
  lastContactedAt?: string | null;
  tags?: string[];
}): { score: number; reasons: string[]; recommendation: string } {
  let score = 0;
  const reasons: string[] = [];

  // Profile completeness (30 points)
  if (contact.firstName) { score += 5; }
  if (contact.lastName) { score += 5; }
  if (contact.company) { score += 10; reasons.push("Tiene empresa identificada"); }
  if (contact.jobTitle) { score += 10; reasons.push("Cargo conocido"); }

  // Job title scoring (20 points)
  const highValueTitles = ["ceo", "cto", "founder", "director", "head", "vp", "owner", "manager"];
  if (contact.jobTitle && highValueTitles.some((t) => contact.jobTitle!.toLowerCase().includes(t))) {
    score += 20;
    reasons.push("Cargo de decisión");
  }

  // Engagement scoring (30 points)
  if (contact.status === "replied") { score += 30; reasons.push("Ya respondió"); }
  else if (contact.status === "contacted") { score += 10; reasons.push("Ya contactado"); }
  else if (contact.status === "qualified") { score += 25; reasons.push("Calificado"); }

  // Recency (10 points)
  if (contact.lastContactedAt) {
    const daysSince = (Date.now() - new Date(contact.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) { score += 10; reasons.push("Contacto reciente"); }
    else if (daysSince < 30) { score += 5; }
  }

  // Network bonus (10 points)
  if (contact.network === "linkedin") { score += 10; reasons.push("LinkedIn (alto valor B2B)"); }
  else if (contact.network === "email") { score += 8; }
  else if (contact.network === "fiverr") { score += 7; }

  score = Math.min(score, 100);

  // Recommendation
  let recommendation = "";
  if (score >= 80) recommendation = "🔥 Lead caliente - Contactar YA";
  else if (score >= 60) recommendation = "🟡 Lead tibio - Seguimiento activo";
  else if (score >= 40) recommendation = "🟢 Lead frío - Nutrir con contenido";
  else recommendation = "⚪ Lead nuevo - Iniciar secuencia";

  return { score, reasons, recommendation };
}


// Campaign Strategy Generator
export function generateCampaignStrategy(params: {
  network: string;
  objective: "get_clients" | "sell_product" | "grow_network" | "brand_awareness";
  product?: { name: string; price: string; };
  dailyBudgetTime: "low" | "medium" | "high"; // how much time/effort per day
}): {
  name: string;
  steps: { type: string; network: string; delayHours: number; description: string }[];
  settings: { dailyLimit: number; startHour: number; endHour: number; };
  tips: string[];
} {
  const { network, objective, dailyBudgetTime } = params;
  const limits = { low: 10, medium: 25, high: 50 };
  const dailyLimit = limits[dailyBudgetTime];

  const strategies: Record<string, Record<string, unknown>> = {
    linkedin_get_clients: {
      name: `LinkedIn - Captación de Clientes`,
      steps: [
        { type: "visit_profile", network: "linkedin", delayHours: 0, description: "Visitar perfil del prospecto" },
        { type: "connection_request", network: "linkedin", delayHours: 4, description: "Enviar solicitud de conexión con nota personalizada" },
        { type: "wait", network: "linkedin", delayHours: 48, description: "Esperar aceptación (2 días)" },
        { type: "message", network: "linkedin", delayHours: 24, description: "Primer mensaje de valor (sin vender)" },
        { type: "wait", network: "linkedin", delayHours: 72, description: "Esperar respuesta (3 días)" },
        { type: "message", network: "linkedin", delayHours: 0, description: "Follow-up con caso de éxito" },
        { type: "wait", network: "linkedin", delayHours: 96, description: "Esperar (4 días)" },
        { type: "message", network: "linkedin", delayHours: 0, description: "Propuesta directa con CTA" },
      ],
      tips: ["No vendas en la primera interacción", "Personaliza cada mensaje", "Usa su nombre y empresa"],
    },
    fiverr_get_clients: {
      name: `Fiverr - Captación Activa`,
      steps: [
        { type: "message", network: "fiverr", delayHours: 0, description: "Propuesta personalizada al proyecto" },
        { type: "wait", network: "fiverr", delayHours: 48, description: "Esperar respuesta (2 días)" },
        { type: "message", network: "fiverr", delayHours: 0, description: "Follow-up con portfolio relevante" },
        { type: "wait", network: "fiverr", delayHours: 72, description: "Esperar (3 días)" },
        { type: "message", network: "fiverr", delayHours: 0, description: "Última propuesta con descuento" },
      ],
      tips: ["Lee el brief completo antes de proponer", "Muestra trabajos similares", "Ofrece algo extra gratis"],
    },
    instagram_get_clients: {
      name: `Instagram - Prospección Visual`,
      steps: [
        { type: "follow", network: "instagram", delayHours: 0, description: "Seguir al prospecto" },
        { type: "like", network: "instagram", delayHours: 2, description: "Like a 3 publicaciones recientes" },
        { type: "wait", network: "instagram", delayHours: 24, description: "Esperar que vea tu perfil" },
        { type: "message", network: "instagram", delayHours: 0, description: "DM casual referenciando su contenido" },
        { type: "wait", network: "instagram", delayHours: 72, description: "Esperar respuesta" },
        { type: "message", network: "instagram", delayHours: 0, description: "Propuesta de valor" },
      ],
      tips: ["Tu perfil debe ser atractivo primero", "Comenta en sus posts antes de DM", "Sé visual y usa emojis"],
    },
  };

  const key = `${network}_${objective}`;
  const strategy = strategies[key] || strategies.linkedin_get_clients;

  return {
    name: strategy.name as string,
    steps: strategy.steps as { type: string; network: string; delayHours: number; description: string }[],
    settings: { dailyLimit, startHour: 9, endHour: 18 },
    tips: (strategy.tips as string[]) || [],
  };
}

export { PLATFORM_RULES };
