import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/seed - Seed the database with demo data
export async function POST() {
  try {
    // Create default user
    const user = await prisma.user.upsert({
      where: { id: "default-user" },
      update: {},
      create: {
        id: "default-user",
        email: "demo@prospector.ai",
        name: "Demo User",
        password: "demo123",
        plan: "pro",
      },
    });

    // Create network accounts
    const networks = ["linkedin", "fiverr", "twitter", "instagram", "email"];
    for (const network of networks) {
      await prisma.networkAccount.upsert({
        where: { id: `account-${network}` },
        update: {},
        create: {
          id: `account-${network}`,
          userId: user.id,
          network,
          accountName: `Mi cuenta ${network}`,
          isActive: true,
          dailyLimit: network === "linkedin" ? 30 : 50,
        },
      });
    }

    // Create sample contacts
    const sampleContacts = [
      { firstName: "Carlos", lastName: "García", company: "TechCorp", jobTitle: "CEO", network: "linkedin", status: "qualified", score: 85 },
      { firstName: "María", lastName: "López", company: "DesignStudio", jobTitle: "Director Creativo", network: "linkedin", status: "contacted", score: 60 },
      { firstName: "James", lastName: "Wilson", company: "StartupXYZ", jobTitle: "CTO", network: "fiverr", status: "new", score: 40 },
      { firstName: "Ana", lastName: "Martínez", company: "EcommerceMax", jobTitle: "Marketing Manager", network: "instagram", status: "replied", score: 75 },
      { firstName: "David", lastName: "Chen", company: "CloudNine", jobTitle: "VP Engineering", network: "twitter", status: "converted", score: 95 },
      { firstName: "Laura", lastName: "Fernández", company: "SaaS Pro", jobTitle: "Head of Sales", network: "email", status: "qualified", score: 80 },
      { firstName: "Roberto", lastName: "Díaz", company: "AgenciaDigital", jobTitle: "Founder", network: "linkedin", status: "new", score: 30 },
      { firstName: "Sophie", lastName: "Martin", company: "Freelance", jobTitle: "Web Developer", network: "fiverr", status: "contacted", score: 55 },
      { firstName: "Miguel", lastName: "Torres", company: "Innovatech", jobTitle: "Product Manager", network: "linkedin", status: "replied", score: 70 },
      { firstName: "Sarah", lastName: "Johnson", company: "GrowthHack", jobTitle: "Growth Lead", network: "twitter", status: "new", score: 45 },
      { firstName: "Pedro", lastName: "Ruiz", company: "DataDriven", jobTitle: "Data Analyst", network: "email", status: "contacted", score: 50 },
      { firstName: "Elena", lastName: "Sánchez", company: "BrandMakers", jobTitle: "Brand Strategist", network: "instagram", status: "qualified", score: 88 },
    ];

    for (const contact of sampleContacts) {
      await prisma.contact.create({
        data: {
          userId: user.id,
          ...contact,
          email: `${contact.firstName.toLowerCase()}@${contact.company?.toLowerCase().replace(/\s/g, "")}.com`,
          tags: JSON.stringify(["prospect", contact.network]),
          profileUrl: `https://${contact.network}.com/${contact.firstName.toLowerCase()}${contact.lastName.toLowerCase()}`,
        },
      });
    }

    // Create sample templates
    const sampleTemplates = [
      {
        name: "Conexión LinkedIn - Cold",
        network: "linkedin",
        type: "connection_request",
        content: "Hola {{firstName}}, vi tu perfil y me impresionó tu trabajo en {{company}}. Me encantaría conectar y explorar sinergias. ¡Saludos!",
      },
      {
        name: "Mensaje LinkedIn - Seguimiento",
        network: "linkedin",
        type: "message",
        content: "Hola {{firstName}}, gracias por aceptar mi conexión. Noté que en {{company}} están trabajando en cosas interesantes. Tengo una propuesta que podría interesarte. ¿Tienes 15 min esta semana para una llamada rápida?",
      },
      {
        name: "Propuesta Fiverr",
        network: "fiverr",
        type: "message",
        content: "¡Hola {{firstName}}! Vi tu proyecto y creo que puedo ayudarte. Tengo experiencia específica en lo que necesitas. Te ofrezco: ✅ Entrega rápida ✅ Revisiones ilimitadas ✅ Soporte 24/7. ¿Hablamos?",
      },
      {
        name: "DM Instagram",
        network: "instagram",
        type: "message",
        content: "Hey {{firstName}}! 👋 Me encanta lo que estás haciendo con {{company}}. Trabajo en algo similar y creo que podríamos colaborar. ¿Te interesa?",
      },
      {
        name: "Cold Email",
        network: "email",
        type: "email",
        subject: "{{firstName}}, una idea para {{company}}",
        content: "Hola {{firstName}},\n\nEspero que estés bien. Me llamo [Tu nombre] y ayudo a empresas como {{company}} a [beneficio principal].\n\nHe notado que [observación específica] y creo que podría ayudarte a [resultado].\n\n¿Tienes 15 minutos esta semana para una llamada rápida?\n\nSaludos,\n[Tu nombre]",
      },
      {
        name: "Twitter DM",
        network: "twitter",
        type: "message",
        content: "Hey {{firstName}}! Acabo de ver tu tweet sobre [tema]. Totalmente de acuerdo. Trabajo en algo relacionado en {{company}}. ¿Te apetece intercambiar ideas?",
      },
    ];

    for (const template of sampleTemplates) {
      const variableMatches = template.content.match(/\{\{(\w+)\}\}/g) || [];
      const variables = [...new Set(variableMatches.map((v) => v.replace(/\{\{|\}\}/g, "")))];

      await prisma.template.create({
        data: {
          userId: user.id,
          ...template,
          variables: JSON.stringify(variables),
        },
      });
    }

    // Create sample campaigns
    const campaign1 = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: "LinkedIn Outreach - Tech CEOs",
        description: "Campaña de prospección dirigida a CEOs y CTOs de empresas tech",
        network: "linkedin",
        status: "active",
        settings: JSON.stringify({ dailyLimit: 30, startHour: 9, endHour: 18, timezone: "Europe/Madrid" }),
        stats: JSON.stringify({ sent: 45, replied: 12, converted: 3 }),
      },
    });

    await prisma.campaignStep.createMany({
      data: [
        { campaignId: campaign1.id, order: 1, type: "visit_profile", network: "linkedin", delayHours: 0, config: "{}" },
        { campaignId: campaign1.id, order: 2, type: "connection_request", network: "linkedin", delayHours: 2, config: "{}" },
        { campaignId: campaign1.id, order: 3, type: "wait", network: "linkedin", delayHours: 48, config: "{\"condition\": \"connection_accepted\"}" },
        { campaignId: campaign1.id, order: 4, type: "message", network: "linkedin", delayHours: 24, config: "{}" },
        { campaignId: campaign1.id, order: 5, type: "wait", network: "linkedin", delayHours: 72, config: "{\"condition\": \"no_reply\"}" },
        { campaignId: campaign1.id, order: 6, type: "message", network: "linkedin", delayHours: 0, config: "{\"followUp\": true}" },
      ],
    });

    const campaign2 = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: "Fiverr Client Acquisition",
        description: "Propuestas automatizadas para proyectos relevantes en Fiverr",
        network: "fiverr",
        status: "active",
        settings: JSON.stringify({ dailyLimit: 20, startHour: 8, endHour: 22 }),
        stats: JSON.stringify({ sent: 30, replied: 8, converted: 5 }),
      },
    });

    await prisma.campaignStep.createMany({
      data: [
        { campaignId: campaign2.id, order: 1, type: "message", network: "fiverr", delayHours: 0, config: "{}" },
        { campaignId: campaign2.id, order: 2, type: "wait", network: "fiverr", delayHours: 48, config: "{\"condition\": \"no_reply\"}" },
        { campaignId: campaign2.id, order: 3, type: "message", network: "fiverr", delayHours: 0, config: "{\"followUp\": true}" },
      ],
    });

    await prisma.campaign.create({
      data: {
        userId: user.id,
        name: "Multi-Channel VIP Prospects",
        description: "Secuencia multicanal para prospectos de alto valor",
        network: "multi",
        status: "draft",
        settings: JSON.stringify({ dailyLimit: 10, startHour: 10, endHour: 17 }),
        stats: JSON.stringify({ sent: 0, replied: 0, converted: 0 }),
      },
    });

    // Create sample analytics events
    const eventTypes = ["message_sent", "reply_received", "connection_accepted", "profile_viewed", "conversion"];
    const analyticsData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dailyEvents = Math.floor(Math.random() * 15) + 5;
      for (let j = 0; j < dailyEvents; j++) {
        const eventDate = new Date(date);
        eventDate.setHours(Math.floor(Math.random() * 10) + 8);
        eventDate.setMinutes(Math.floor(Math.random() * 60));
        
        analyticsData.push({
          userId: user.id,
          network: networks[Math.floor(Math.random() * networks.length)],
          eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          metadata: "{}",
          createdAt: eventDate,
        });
      }
    }

    await prisma.analyticsEvent.createMany({ data: analyticsData });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        contacts: sampleContacts.length,
        templates: sampleTemplates.length,
        campaigns: 3,
        analyticsEvents: analyticsData.length,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json({ error: "Error seeding database" }, { status: 500 });
  }
}
