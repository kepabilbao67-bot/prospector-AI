// ProspectorAI - Account Warmup System
// Gradually increases activity limits to avoid bans on new accounts

export interface WarmupPlan {
  network: string;
  day: number;
  dailyLimit: number;
  actions: string[];
  tips: string;
  riskLevel: "low" | "medium" | "high";
}

// Generate warmup plan for a network
export function generateWarmupPlan(network: string, totalDays: number = 21): WarmupPlan[] {
  const plans: Record<string, (day: number) => WarmupPlan> = {
    linkedin: (day) => {
      const limit = day <= 3 ? 5 : day <= 7 ? 10 : day <= 14 ? 20 : 30;
      const actions = day <= 3
        ? ["Completar perfil", "Unirse a 2 grupos", "Publicar 1 post"]
        : day <= 7
        ? ["5 conexiones/día", "3 likes", "1 comentario"]
        : day <= 14
        ? ["10 conexiones", "Mensajes a conexiones", "2 comentarios"]
        : ["Prospección completa activa"];
      return {
        network: "linkedin",
        day,
        dailyLimit: limit,
        actions,
        tips: day <= 7
          ? "Fase de calentamiento. No envíes mensajes masivos aún."
          : day <= 14
          ? "Incrementando gradualmente. Empieza a enviar mensajes personalizados."
          : "Cuenta calentada. Puedes prospectar a ritmo normal.",
        riskLevel: day <= 7 ? "low" : day <= 14 ? "medium" : "low",
      };
    },
    fiverr: (day) => {
      const limit = day <= 3 ? 3 : day <= 7 ? 8 : day <= 14 ? 15 : 20;
      return {
        network: "fiverr",
        day,
        dailyLimit: limit,
        actions: day <= 3
          ? ["Completar perfil", "Crear 2 gigs", "Subir portfolio"]
          : day <= 7
          ? ["Responder buyer requests (3-5)", "Optimizar gigs"]
          : ["Prospección activa", "Propuestas personalizadas"],
        tips: day <= 7
          ? "Enfócate en completar tu perfil y conseguir tus primeras reviews."
          : "Puedes enviar propuestas activamente. Siempre personaliza.",
        riskLevel: "low",
      };
    },
    instagram: (day) => {
      const limit = day <= 5 ? 10 : day <= 10 ? 25 : day <= 15 ? 35 : 40;
      return {
        network: "instagram",
        day,
        dailyLimit: limit,
        actions: day <= 5
          ? ["Publicar 3 posts", "5 stories", "10 likes orgánicos"]
          : day <= 10
          ? ["Follows selectivos", "Comentarios", "Stories diarias"]
          : ["DMs moderados", "Engagement activo", "Follows + unfollows"],
        tips: day <= 5
          ? "Crea contenido primero. Instagram valora cuentas activas con contenido."
          : day <= 10
          ? "Empieza a interactuar. Mantén un ratio follow/unfollow natural."
          : "Puedes empezar DMs. Siempre referencia su contenido.",
        riskLevel: day <= 10 ? "low" : day <= 15 ? "medium" : "low",
      };
    },
    email: (day) => {
      const limit = day <= 3 ? 10 : day <= 7 ? 25 : day <= 14 ? 50 : 100;
      return {
        network: "email",
        day,
        dailyLimit: limit,
        actions: day <= 3
          ? ["Configurar SPF/DKIM/DMARC", "Enviar a contactos conocidos", "Verificar inbox"]
          : day <= 7
          ? ["Enviar a listas pequeñas", "Variar asuntos", "Monitorear bounce rate"]
          : ["Escalada gradual", "A/B testing asuntos", "Cold emails completos"],
        tips: day <= 3
          ? "IMPORTANTE: Configura autenticación (SPF, DKIM, DMARC) antes de enviar."
          : day <= 7
          ? "Envía primero a gente que te conoce. Mejora tu reputación de sender."
          : "Tu dominio está calentado. Puedes escalar volumen.",
        riskLevel: day <= 3 ? "low" : day <= 7 ? "medium" : "low",
      };
    },
    twitter: (day) => {
      const limit = day <= 5 ? 10 : day <= 10 ? 25 : 50;
      return {
        network: "twitter",
        day,
        dailyLimit: limit,
        actions: day <= 5
          ? ["Publicar tweets", "Retweetear contenido", "Responder a hilos"]
          : day <= 10
          ? ["Follows selectivos", "DMs a quienes interactúan contigo", "Threads"]
          : ["Prospección activa via DM", "Engagement masivo"],
        tips: day <= 5
          ? "Publica contenido de valor. Twitter no limita mucho pero valora la actividad orgánica."
          : "Puedes empezar DMs a quienes ya interactúan contigo.",
        riskLevel: "low",
      };
    },
  };

  const generator = plans[network] || plans.linkedin;
  const result: WarmupPlan[] = [];

  for (let day = 1; day <= totalDays; day++) {
    result.push(generator(day));
  }

  return result;
}

// Get current warmup status
export function getWarmupStatus(network: string, accountCreatedDays: number): {
  phase: "warming" | "ready" | "cooling";
  progress: number;
  currentLimit: number;
  nextMilestone: string;
  recommendation: string;
} {
  const plan = generateWarmupPlan(network);
  const currentDay = Math.min(accountCreatedDays, plan.length);
  const currentPlan = plan[currentDay - 1] || plan[plan.length - 1];
  const progress = Math.min((accountCreatedDays / 21) * 100, 100);

  let phase: "warming" | "ready" | "cooling" = "warming";
  let nextMilestone = "";
  let recommendation = "";

  if (progress >= 100) {
    phase = "ready";
    nextMilestone = "¡Cuenta lista para producción!";
    recommendation = "Tu cuenta está completamente calentada. Puedes prospectar al 100%.";
  } else if (progress >= 66) {
    phase = "warming";
    nextMilestone = `${21 - accountCreatedDays} días para estar listo`;
    recommendation = "Estás en la recta final. Incrementa gradualmente las acciones.";
  } else {
    phase = "warming";
    nextMilestone = `Día ${currentDay}/21 - Límite actual: ${currentPlan.dailyLimit}/día`;
    recommendation = currentPlan.tips;
  }

  return {
    phase,
    progress: Math.round(progress),
    currentLimit: currentPlan.dailyLimit,
    nextMilestone,
    recommendation,
  };
}
