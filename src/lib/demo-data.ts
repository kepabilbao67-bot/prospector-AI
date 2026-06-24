// Demo data for when no database is available (Vercel without DB)
// This makes the app fully functional for demos and testing

export const DEMO_USER = {
  id: "default-user",
  email: "demo@prospector.ai",
  name: "Demo User",
  plan: "pro",
};

export const DEMO_CONTACTS = [
  { id: "c1", userId: "default-user", firstName: "Carlos", lastName: "García", company: "TechCorp", jobTitle: "CEO", network: "linkedin", email: "carlos@techcorp.com", status: "qualified", score: 85, tags: '["prospect","linkedin"]', profileUrl: "https://linkedin.com/in/carlosgarcia", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c2", userId: "default-user", firstName: "María", lastName: "López", company: "DesignStudio", jobTitle: "Director Creativo", network: "linkedin", email: "maria@designstudio.com", status: "contacted", score: 60, tags: '["prospect"]', profileUrl: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c3", userId: "default-user", firstName: "James", lastName: "Wilson", company: "StartupXYZ", jobTitle: "CTO", network: "fiverr", email: "james@startupxyz.com", status: "new", score: 40, tags: '["fiverr"]', profileUrl: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c4", userId: "default-user", firstName: "Ana", lastName: "Martínez", company: "EcommerceMax", jobTitle: "Marketing Manager", network: "instagram", email: "ana@ecommercemax.com", status: "replied", score: 75, tags: '["hot_lead"]', profileUrl: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c5", userId: "default-user", firstName: "David", lastName: "Chen", company: "CloudNine", jobTitle: "VP Engineering", network: "twitter", email: "david@cloudnine.com", status: "converted", score: 95, tags: '["client"]', profileUrl: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c6", userId: "default-user", firstName: "Laura", lastName: "Fernández", company: "SaaS Pro", jobTitle: "Head of Sales", network: "email", email: "laura@saaspro.com", status: "qualified", score: 80, tags: '["prospect","email"]', profileUrl: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c7", userId: "default-user", firstName: "Roberto", lastName: "Díaz", company: "AgenciaDigital", jobTitle: "Founder", network: "linkedin", email: "roberto@agenciadigital.com", status: "new", score: 30, tags: '["cold"]', profileUrl: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c8", userId: "default-user", firstName: "Sophie", lastName: "Martin", company: "Freelance", jobTitle: "Web Developer", network: "fiverr", email: "sophie@freelance.com", status: "contacted", score: 55, tags: '["fiverr"]', profileUrl: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const DEMO_CAMPAIGNS = [
  { id: "camp1", userId: "default-user", name: "LinkedIn Outreach - Tech CEOs", description: "Prospección dirigida a CEOs de empresas tech", network: "linkedin", status: "active", settings: '{"dailyLimit":30,"startHour":9,"endHour":18}', stats: '{"sent":45,"replied":12,"converted":3}', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), steps: [{ id: "s1", order: 1, type: "visit_profile", network: "linkedin", delayHours: 0 }, { id: "s2", order: 2, type: "connection_request", network: "linkedin", delayHours: 4 }, { id: "s3", order: 3, type: "wait", network: "linkedin", delayHours: 48 }, { id: "s4", order: 4, type: "message", network: "linkedin", delayHours: 24 }], campaignContacts: [] },
  { id: "camp2", userId: "default-user", name: "Fiverr Client Acquisition", description: "Propuestas automatizadas en Fiverr", network: "fiverr", status: "active", settings: '{"dailyLimit":20,"startHour":8,"endHour":22}', stats: '{"sent":30,"replied":8,"converted":5}', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), steps: [{ id: "s5", order: 1, type: "message", network: "fiverr", delayHours: 0 }, { id: "s6", order: 2, type: "wait", network: "fiverr", delayHours: 48 }], campaignContacts: [] },
  { id: "camp3", userId: "default-user", name: "Instagram DM - Branding", description: "Captación visual para servicios de branding", network: "instagram", status: "paused", settings: '{"dailyLimit":15}', stats: '{"sent":20,"replied":6,"converted":2}', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), steps: [], campaignContacts: [] },
];

export const DEMO_TEMPLATES = [
  { id: "t1", userId: "default-user", name: "Conexión LinkedIn - Profesional", network: "linkedin", type: "connection_request", subject: null, content: "Hola {{firstName}}, he visto tu trayectoria en {{company}} y me interesa mucho lo que hacéis. Me encantaría conectar.", variables: '["firstName","company"]', usageCount: 34, replyRate: 42, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "t2", userId: "default-user", name: "Primer Mensaje - Valor", network: "linkedin", type: "message", subject: null, content: "{{firstName}}, gracias por conectar. Vi que en {{company}} estáis enfocados en [sector]. Trabajo ayudando a empresas como la tuya a mejorar resultados. ¿10 min para una llamada?", variables: '["firstName","company"]', usageCount: 28, replyRate: 35, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "t3", userId: "default-user", name: "Propuesta Fiverr", network: "fiverr", type: "message", subject: null, content: "Hola {{firstName}}, vi tu proyecto y tengo experiencia específica en lo que necesitas. Te ofrezco entrega rápida y revisiones ilimitadas. ¿Hablamos?", variables: '["firstName"]', usageCount: 22, replyRate: 38, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "t4", userId: "default-user", name: "Cold Email", network: "email", type: "email", subject: "{{firstName}}, una idea para {{company}}", content: "Hola {{firstName}},\n\nSoy [nombre] y ayudo a empresas como {{company}} a [beneficio].\n\n¿Tienes 10 minutos esta semana?\n\nSaludos", variables: '["firstName","company"]', usageCount: 15, replyRate: 22, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const DEMO_ANALYTICS = {
  stats: { messagesSent: 95, repliesReceived: 26, connectionsAccepted: 38, profilesViewed: 120, conversions: 10 },
  replyRate: "27.4",
  conversionRate: "10.5",
  chartData: [],
  networkStats: { linkedin: { message_sent: 45, reply_received: 12 }, fiverr: { message_sent: 30, reply_received: 8 }, instagram: { message_sent: 20, reply_received: 6 } },
  totalEvents: 289,
};
