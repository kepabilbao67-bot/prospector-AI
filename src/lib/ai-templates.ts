// ProspectorAI - Extended AI Templates (English + Spanish)
// More message templates, objection handling, and all network strategies

// ============ ENGLISH TEMPLATES ============
export const ENGLISH_TEMPLATES: Record<string, Record<string, string[]>> = {
  connection_en: {
    professional: [
      "Hi {firstName}, I came across your profile and was impressed by your work at {company}. I'd love to connect and exchange ideas about {industry}.",
      "{firstName}, your background caught my attention. I work in a complementary field and believe we could find interesting synergies. Let's connect?",
      "Hello {firstName}, we're in the same space and I think we share a similar vision. I'd love to add you to my professional network.",
    ],
    casual: [
      "Hey {firstName}! I saw what you're doing at {company} - really cool stuff. Would love to connect!",
      "Hi {firstName}! Your profile is super interesting. Want to connect?",
    ],
    friendly: [
      "Hey {firstName}! Love what you're doing at {company}. Would be great to connect and share ideas!",
      "{firstName}, I follow your work and think it's awesome. Let's connect! 🚀",
    ],
  },
  first_message_en: {
    professional: [
      "Hi {firstName}, thanks for connecting. I noticed {company} is focused on [sector]. I help companies like yours {benefit}. Would you have 10 minutes this week for a quick call where I can show you how?",
      "{firstName}, great to be connected. I've noticed {company} could benefit from {product}. No commitment - can I tell you in 2 minutes how it works?",
      "Hi {firstName}, I've been following {company}'s growth and believe I can help you {benefit}. I've helped similar companies achieve [specific result]. Worth a quick chat?",
    ],
    casual: [
      "{firstName}! Thanks for accepting. Hey, I've got something I think would interest you for {company}. Can I share? No spam, promise 😄",
      "Hey {firstName}, now that we're connected... did you know I can help you with {benefit}? Give me 5 min and I'll explain.",
    ],
    direct: [
      "{firstName}, I'll get straight to the point: I can help {company} {benefit}. I have proven results with similar companies. 10 min call?",
      "Hi {firstName}. Direct proposal: {product} for {company}. Guaranteed ROI. 15 min for a demo?",
    ],
  },
  follow_up_en: {
    professional: [
      "Hi {firstName}, I reached out a few days ago about {topic}. I understand you're busy, but I genuinely believe this could interest you. Is there a better time to talk?",
      "{firstName}, just following up. I saw a recent success story that applies perfectly to {company}. Want me to share it?",
      "Hi {firstName}, I don't want to be pushy but I believe {product} fits perfectly with what you're doing at {company}. Can I send you a 1-min case study?",
    ],
    casual: [
      "Hey {firstName}, did you catch my previous message? Don't want to be annoying, just wanted to make sure it didn't get lost. Chat?",
      "{firstName}! Just checking in to remind you I'm here to help with {benefit}. No pressure 😊",
    ],
  },
  proposal_en: {
    professional: [
      "Hi {firstName},\n\nAfter analyzing {company}'s needs, I've prepared a specific proposal:\n\n📋 Service: {product}\n💰 Investment: {price}\n🎯 Expected result: {benefit}\n⏱️ Timeline: {timeline}\n\nWould you like to review it in detail on a 15-min call?",
      "{firstName}, based on our conversation, here's what I can offer:\n\n✅ {product}\n✅ {benefit}\n✅ Satisfaction guarantee\n\nSpecial price for limited time: {price}\n\nShall we move forward?",
    ],
  },
  closing_en: {
    professional: [
      "{firstName}, we've talked several times and I think the value {product} can bring to {company} is clear. What's holding you back from making the decision? I'm here to resolve any doubts.",
      "Hi {firstName}, I want to be transparent: the special offer I mentioned expires this Friday. If something's holding you back, tell me and we'll solve it. Deal?",
    ],
    direct: [
      "{firstName}, last chance: the special price of {price} for {product} expires in 48h. After that, it's standard pricing. Shall we close today?",
    ],
  },
  cold_email_en: {
    professional: [
      "Subject: {firstName}, an idea for {company}\n\nHi {firstName},\n\nI'm [name] and I help {jobTitle}s like you {benefit}.\n\nI've researched {company} and see a clear opportunity for {opportunity}.\n\nIn the last 3 months, I helped [X similar companies] achieve [specific result].\n\nDo you have 10 minutes for a quick call?\n\nBest regards,\n[signature]",
    ],
  },
};

// ============ OBJECTION HANDLING ============
export const OBJECTION_HANDLERS: Record<string, { trigger: string[]; responses: Record<string, string[]> }> = {
  too_expensive: {
    trigger: ["caro", "expensive", "no tengo presupuesto", "budget", "can't afford", "muy caro", "no puedo pagar"],
    responses: {
      es: [
        "{firstName}, entiendo la preocupación por el precio. Pero déjame preguntarte: ¿cuánto te cuesta NO resolver este problema cada mes? Mis clientes recuperan la inversión en menos de 30 días. ¿Te cuento cómo?",
        "Comprendo {firstName}. Precisamente por eso ofrezco un plan de pago flexible. Además, si no ves resultados en 30 días, te devuelvo el dinero. ¿Qué te parece si empezamos con el plan más básico?",
        "{firstName}, muchos de mis mejores clientes pensaban lo mismo al principio. Luego vieron que {product} les generó un retorno de 5x-10x. ¿Puedo mostrarte los números de un caso real similar al tuyo?",
      ],
      en: [
        "{firstName}, I understand the price concern. But let me ask: how much is NOT solving this problem costing you every month? My clients recover their investment in less than 30 days. Can I show you how?",
        "I get it {firstName}. That's exactly why I offer flexible payment plans. Plus, if you don't see results in 30 days, money back guarantee. What if we start with the most basic plan?",
        "{firstName}, many of my best clients thought the same initially. Then they saw {product} generated 5x-10x returns. Can I show you real numbers from a similar case?",
      ],
    },
  },
  no_time: {
    trigger: ["no tengo tiempo", "busy", "ahora no puedo", "más adelante", "later", "not now", "occupied"],
    responses: {
      es: [
        "Lo entiendo perfectamente {firstName}, todos estamos a tope. Precisamente por eso {product} te ahorra {timeline} de trabajo. ¿5 minutos de tu tiempo ahora podrían ahorrarte horas después?",
        "{firstName}, respeto tu tiempo al 100%. ¿Qué te parece si te envío un vídeo de 2 minutos que explica todo? Lo ves cuando puedas y si te interesa, hablamos. Sin presión.",
        "Sin problema {firstName}. ¿Cuándo sería un mejor momento? Puedo adaptarme a tu agenda. Incluso 10 minutos serían suficientes.",
      ],
      en: [
        "I totally understand {firstName}, we're all maxed out. That's exactly why {product} saves you {timeline} of work. Could 5 minutes of your time now save you hours later?",
        "{firstName}, I 100% respect your time. How about I send you a 2-minute video that explains everything? Watch it whenever and if you're interested, we'll talk. No pressure.",
        "No problem {firstName}. When would be a better time? I can adapt to your schedule. Even 10 minutes would be enough.",
      ],
    },
  },
  need_to_think: {
    trigger: ["pensarlo", "think about it", "lo tengo que pensar", "need to think", "let me think", "consultarlo"],
    responses: {
      es: [
        "Por supuesto {firstName}, tómate tu tiempo. Para ayudarte a decidir, ¿hay algo específico que te genera dudas? Puedo darte más info sobre ese punto concreto.",
        "{firstName}, entiendo. Solo para que sepas: la oferta actual de {price} es válida hasta el viernes. Después será el precio estándar. ¿Hay algo que pueda aclarar mientras lo piensas?",
        "Perfecto {firstName}. Te dejo un recurso que puede ayudarte a decidir: [caso de éxito / demo / testimonios]. Si tienes preguntas, aquí estoy.",
      ],
      en: [
        "Of course {firstName}, take your time. To help you decide, is there something specific that's creating doubt? I can provide more info on that exact point.",
        "{firstName}, understood. Just so you know: the current offer at {price} is valid until Friday. After that, it's standard pricing. Can I clarify anything while you think it over?",
        "Perfect {firstName}. Let me leave you a resource that might help you decide: [case study / demo / testimonials]. If you have questions, I'm here.",
      ],
    },
  },
  already_have_solution: {
    trigger: ["ya tengo", "already have", "uso otro", "using another", "competitor", "ya trabajo con"],
    responses: {
      es: [
        "{firstName}, genial que ya tengas una solución. Solo por curiosidad, ¿estás 100% satisfecho con los resultados? Muchos de mis clientes venían de [competidor] y vieron una mejora del 40% al cambiar.",
        "Entiendo {firstName}. No te pido que cambies, solo que compares. Si en 15 minutos puedo mostrarte cómo mejorar lo que ya tienes sin riesgo, ¿te parecería justo?",
        "{firstName}, perfecto. ¿Y si te digo que {product} se complementa con lo que ya usas y puede potenciar tus resultados sin reemplazar nada? Te cuento en 5 min.",
      ],
      en: [
        "{firstName}, great that you already have a solution. Just curious - are you 100% satisfied with the results? Many of my clients came from [competitor] and saw a 40% improvement after switching.",
        "I understand {firstName}. I'm not asking you to switch, just to compare. If in 15 minutes I can show you how to improve what you already have with no risk, would that be fair?",
        "{firstName}, perfect. What if I told you {product} complements what you already use and can boost your results without replacing anything? 5 min to explain.",
      ],
    },
  },
  not_interested: {
    trigger: ["no me interesa", "not interested", "no gracias", "no thanks", "pass", "no necesito"],
    responses: {
      es: [
        "Entendido {firstName}, lo respeto. Solo por curiosidad: ¿es porque ya tienes resuelto {benefit} o porque ahora no es prioridad? Pregunto para no molestarte en el futuro si cambias de opinión.",
        "Sin problema {firstName}. Te deseo mucho éxito. Solo una última cosa: ¿puedo dejarte mi contacto por si en el futuro necesitas algo relacionado con {product}? Prometo no insistir.",
        "Perfecto {firstName}, respetado. Si alguna vez necesitas ayuda con {benefit}, ya sabes dónde estoy. ¡Éxitos!",
      ],
      en: [
        "Understood {firstName}, I respect that. Just curious: is it because you already have {benefit} sorted, or because it's not a priority right now? I ask so I don't bother you if things change.",
        "No problem {firstName}. Wishing you great success. Just one last thing: can I leave my contact info in case you ever need something related to {product}? I promise not to insist.",
        "Perfect {firstName}, respected. If you ever need help with {benefit}, you know where I am. Best of luck!",
      ],
    },
  },
};

// ============ ALL NETWORK STRATEGIES ============
export const ALL_STRATEGIES: Record<string, Record<string, unknown>> = {
  twitter_get_clients: {
    name: "Twitter/X - Captación via Engagement",
    steps: [
      { type: "follow", network: "twitter", delayHours: 0, description: "Seguir al prospecto" },
      { type: "like", network: "twitter", delayHours: 1, description: "Like a 2-3 tweets recientes" },
      { type: "like", network: "twitter", delayHours: 24, description: "Comentar en un tweet relevante (aportar valor)" },
      { type: "wait", network: "twitter", delayHours: 48, description: "Esperar que noten tu engagement" },
      { type: "message", network: "twitter", delayHours: 0, description: "DM casual referenciando sus tweets" },
      { type: "wait", network: "twitter", delayHours: 72, description: "Esperar respuesta" },
      { type: "message", network: "twitter", delayHours: 0, description: "Follow-up con propuesta de valor" },
    ],
    tips: ["Comenta con valor real, no spam", "Referencia tweets específicos en tu DM", "Sé breve - 280 chars máx"],
  },
  email_get_clients: {
    name: "Email - Cold Outreach Profesional",
    steps: [
      { type: "message", network: "email", delayHours: 0, description: "Email inicial personalizado (asunto gancho)" },
      { type: "wait", network: "email", delayHours: 48, description: "Esperar apertura/respuesta" },
      { type: "message", network: "email", delayHours: 0, description: "Follow-up breve (bump)" },
      { type: "wait", network: "email", delayHours: 72, description: "Esperar" },
      { type: "message", network: "email", delayHours: 0, description: "Nuevo ángulo + social proof" },
      { type: "wait", network: "email", delayHours: 96, description: "Esperar" },
      { type: "message", network: "email", delayHours: 0, description: "Oferta limitada" },
      { type: "wait", network: "email", delayHours: 120, description: "Esperar" },
      { type: "message", network: "email", delayHours: 0, description: "Break-up email (último intento)" },
    ],
    tips: ["Asunto < 50 caracteres", "Primer párrafo personalizado", "CTA claro al final", "Evita palabras spam (gratis, oferta, descuento en asunto)"],
  },
  whatsapp_get_clients: {
    name: "WhatsApp - Prospección Directa",
    steps: [
      { type: "message", network: "whatsapp", delayHours: 0, description: "Mensaje inicial breve y personal" },
      { type: "wait", network: "whatsapp", delayHours: 24, description: "Esperar lectura/respuesta" },
      { type: "message", network: "whatsapp", delayHours: 0, description: "Audio breve de seguimiento (30seg)" },
      { type: "wait", network: "whatsapp", delayHours: 72, description: "Esperar" },
      { type: "message", network: "whatsapp", delayHours: 0, description: "Última propuesta con CTA claro" },
    ],
    tips: ["Nunca envíes en horarios antisociales", "Los audios generan más confianza", "Sé muy breve", "No envíes PDFs sin contexto"],
  },
  tiktok_get_clients: {
    name: "TikTok - Engagement + DM",
    steps: [
      { type: "follow", network: "tiktok", delayHours: 0, description: "Seguir al prospecto" },
      { type: "like", network: "tiktok", delayHours: 2, description: "Like + comentario en 2 videos" },
      { type: "wait", network: "tiktok", delayHours: 48, description: "Esperar que vean tu perfil" },
      { type: "message", network: "tiktok", delayHours: 0, description: "DM casual referenciando su contenido" },
      { type: "wait", network: "tiktok", delayHours: 72, description: "Esperar respuesta" },
      { type: "message", network: "tiktok", delayHours: 0, description: "Propuesta adaptada a su audiencia" },
    ],
    tips: ["Tu perfil debe tener buen contenido primero", "Usa su lenguaje/estilo", "Sé informal", "Ofrece colaboración, no venta directa"],
  },
  facebook_get_clients: {
    name: "Facebook - Grupos + Messenger",
    steps: [
      { type: "like", network: "facebook", delayHours: 0, description: "Participar en grupo relevante (aportar valor)" },
      { type: "follow", network: "facebook", delayHours: 24, description: "Agregar como amigo" },
      { type: "wait", network: "facebook", delayHours: 48, description: "Esperar aceptación" },
      { type: "like", network: "facebook", delayHours: 0, description: "React a 3 publicaciones" },
      { type: "wait", network: "facebook", delayHours: 24, description: "Mostrar interés genuino" },
      { type: "message", network: "facebook", delayHours: 0, description: "Mensaje por Messenger (casual, como amigo)" },
      { type: "wait", network: "facebook", delayHours: 72, description: "Esperar" },
      { type: "message", network: "facebook", delayHours: 0, description: "Propuesta natural integrada en conversación" },
    ],
    tips: ["Participa en grupos primero", "No vendas en el primer mensaje", "Sé amigable y genuino", "Facebook es más personal que LinkedIn"],
  },
  linkedin_sell_product: {
    name: "LinkedIn - Venta de Producto/Servicio",
    steps: [
      { type: "visit_profile", network: "linkedin", delayHours: 0, description: "Visitar perfil + investigar necesidades" },
      { type: "connection_request", network: "linkedin", delayHours: 2, description: "Conexión con nota enfocada en su problema" },
      { type: "wait", network: "linkedin", delayHours: 48, description: "Esperar aceptación" },
      { type: "message", network: "linkedin", delayHours: 12, description: "Mensaje de valor (identificar pain point)" },
      { type: "wait", network: "linkedin", delayHours: 48, description: "Esperar respuesta" },
      { type: "message", network: "linkedin", delayHours: 0, description: "Caso de éxito + beneficio cuantificado" },
      { type: "wait", network: "linkedin", delayHours: 72, description: "Esperar" },
      { type: "message", network: "linkedin", delayHours: 0, description: "Propuesta directa con precio y CTA" },
      { type: "wait", network: "linkedin", delayHours: 96, description: "Esperar" },
      { type: "message", network: "linkedin", delayHours: 0, description: "Cierre: oferta limitada / descuento primeros clientes" },
    ],
    tips: ["Investiga su empresa antes de escribir", "Menciona un problema específico que puedas resolver", "Incluye números y resultados reales"],
  },
  fiverr_sell_product: {
    name: "Fiverr - Propuesta Ganadora",
    steps: [
      { type: "message", network: "fiverr", delayHours: 0, description: "Propuesta ultra-personalizada al brief" },
      { type: "wait", network: "fiverr", delayHours: 24, description: "Esperar respuesta" },
      { type: "message", network: "fiverr", delayHours: 0, description: "Añadir bonus/extra gratis para diferenciarse" },
      { type: "wait", network: "fiverr", delayHours: 48, description: "Esperar" },
      { type: "message", network: "fiverr", delayHours: 0, description: "Descuento exclusivo + urgencia (pocos slots)" },
    ],
    tips: ["Responde en < 1 hora para mejor ranking", "Incluye portfolio relevante al proyecto", "Ofrece revision gratis", "Haz preguntas inteligentes sobre el proyecto"],
  },
  instagram_sell_product: {
    name: "Instagram - Venta Visual",
    steps: [
      { type: "follow", network: "instagram", delayHours: 0, description: "Seguir + like stories recientes" },
      { type: "like", network: "instagram", delayHours: 4, description: "Comentar en post (sin vender)" },
      { type: "wait", network: "instagram", delayHours: 24, description: "Esperar que vean tu perfil" },
      { type: "message", network: "instagram", delayHours: 0, description: "DM elogiando su contenido + hook" },
      { type: "wait", network: "instagram", delayHours: 48, description: "Esperar" },
      { type: "message", network: "instagram", delayHours: 0, description: "Mostrar resultado visual (antes/después)" },
      { type: "wait", network: "instagram", delayHours: 72, description: "Esperar" },
      { type: "message", network: "instagram", delayHours: 0, description: "Propuesta con precio + testimonio visual" },
    ],
    tips: ["Tu feed debe ser un portfolio", "Usa antes/después", "Stories > Posts para ventas", "Emojis con moderación"],
  },
};

// ============ DAILY INSIGHTS GENERATOR ============
export function generateDailyInsights(data: {
  messagesSent: number;
  repliesReceived: number;
  conversions: number;
  topNetwork: string;
  activeCampaigns: number;
  queuePending: number;
}): { greeting: string; insights: string[]; actions: string[]; motivation: string } {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  
  const replyRate = data.messagesSent > 0 ? ((data.repliesReceived / data.messagesSent) * 100).toFixed(1) : "0";
  
  const insights: string[] = [];
  const actions: string[] = [];

  // Insights based on data
  if (data.messagesSent > 0) {
    insights.push(`📨 Has enviado ${data.messagesSent} mensajes con una tasa de respuesta del ${replyRate}%`);
  }
  if (data.conversions > 0) {
    insights.push(`🎯 ¡${data.conversions} conversiones! Tu tasa de cierre es buena`);
  }
  if (data.topNetwork) {
    insights.push(`🏆 Tu mejor red es ${data.topNetwork} - concentra esfuerzos ahí`);
  }

  // Recommendations
  if (parseFloat(replyRate) < 10) {
    actions.push("⚠️ Tu tasa de respuesta es baja. Prueba mensajes más cortos y personalizados");
  }
  if (data.activeCampaigns === 0) {
    actions.push("🚀 No tienes campañas activas. Crea una con el Wizard IA");
  }
  if (data.queuePending > 50) {
    actions.push("⏳ Tienes muchas tareas en cola. Revisa que no haya errores");
  }
  if (parseFloat(replyRate) > 25) {
    actions.push("🔥 ¡Gran tasa de respuesta! Considera aumentar el volumen diario");
  }

  // Motivation
  const motivations = [
    "Cada mensaje es una oportunidad. ¡Sigue así!",
    "Los mejores vendedores hacen follow-up. No te rindas.",
    "Un NO hoy puede ser un SÍ mañana. La consistencia gana.",
    "Tu siguiente gran cliente está a un mensaje de distancia.",
    "La automatización trabaja para ti 24/7. Aprovéchalo.",
  ];
  const motivation = motivations[Math.floor(Math.random() * motivations.length)];

  return { greeting, insights, actions, motivation };
}
