// ProspectorAI - Automation Rules Engine
// Trigger-based automations: when X happens, do Y automatically

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface AutomationTrigger {
  type:
    | "new_reply"
    | "no_reply_after"
    | "contact_created"
    | "contact_status_changed"
    | "lead_score_above"
    | "campaign_step_completed"
    | "message_opened"
    | "link_clicked"
    | "appointment_booked"
    | "deal_won"
    | "deal_lost"
    | "tag_added"
    | "time_based";
  config: Record<string, unknown>;
}

export interface AutomationCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "not_equals" | "in_list";
  value: string | number | string[];
}

export interface AutomationAction {
  type:
    | "send_message"
    | "add_tag"
    | "remove_tag"
    | "change_status"
    | "add_to_campaign"
    | "remove_from_campaign"
    | "create_task"
    | "send_notification"
    | "update_score"
    | "move_pipeline_stage"
    | "schedule_follow_up"
    | "send_email"
    | "assign_to_user"
    | "webhook";
  config: Record<string, unknown>;
}

// Pre-built automation templates
export const AUTOMATION_TEMPLATES: AutomationRule[] = [
  {
    id: "auto-1",
    name: "Auto-responder a leads calientes",
    trigger: { type: "new_reply", config: {} },
    conditions: [{ field: "score", operator: "greater_than", value: 70 }],
    actions: [
      { type: "send_notification", config: { message: "🔥 Lead caliente respondió!" } },
      { type: "change_status", config: { status: "replied" } },
      { type: "add_tag", config: { tag: "hot_lead" } },
    ],
    isActive: true,
    executionCount: 23,
  },
  {
    id: "auto-2",
    name: "Follow-up automático (sin respuesta 3 días)",
    trigger: { type: "no_reply_after", config: { hours: 72 } },
    conditions: [{ field: "status", operator: "equals", value: "contacted" }],
    actions: [
      { type: "schedule_follow_up", config: { delayHours: 4, messageType: "follow_up" } },
    ],
    isActive: true,
    executionCount: 156,
  },
  {
    id: "auto-3",
    name: "Nuevo contacto → Iniciar secuencia",
    trigger: { type: "contact_created", config: {} },
    conditions: [{ field: "network", operator: "in_list", value: ["linkedin", "email"] }],
    actions: [
      { type: "update_score", config: { action: "calculate" } },
      { type: "add_to_campaign", config: { campaignType: "auto_select" } },
      { type: "create_task", config: { type: "visit_profile", priority: 7 } },
    ],
    isActive: true,
    executionCount: 89,
  },
  {
    id: "auto-4",
    name: "Lead score alto → Notificación urgente",
    trigger: { type: "lead_score_above", config: { threshold: 80 } },
    conditions: [],
    actions: [
      { type: "send_notification", config: { message: "⚡ Nuevo lead con score > 80", urgent: true } },
      { type: "add_tag", config: { tag: "priority" } },
      { type: "move_pipeline_stage", config: { stage: "qualified" } },
    ],
    isActive: true,
    executionCount: 12,
  },
  {
    id: "auto-5",
    name: "Deal ganado → Celebrar + upsell",
    trigger: { type: "deal_won", config: {} },
    conditions: [],
    actions: [
      { type: "send_notification", config: { message: "🎉 ¡Venta cerrada!" } },
      { type: "change_status", config: { status: "converted" } },
      { type: "add_tag", config: { tag: "client" } },
      { type: "schedule_follow_up", config: { delayHours: 168, messageType: "upsell" } },
    ],
    isActive: true,
    executionCount: 7,
  },
  {
    id: "auto-6",
    name: "No interesado → Parar todo",
    trigger: { type: "contact_status_changed", config: { newStatus: "lost" } },
    conditions: [],
    actions: [
      { type: "remove_from_campaign", config: { all: true } },
      { type: "add_tag", config: { tag: "do_not_contact" } },
    ],
    isActive: true,
    executionCount: 34,
  },
  {
    id: "auto-7",
    name: "Importación CSV → Auto-scoring + asignación",
    trigger: { type: "tag_added", config: { tag: "imported" } },
    conditions: [],
    actions: [
      { type: "update_score", config: { action: "calculate" } },
      { type: "create_task", config: { type: "visit_profile", priority: 5, delayMinutes: 30 } },
    ],
    isActive: false,
    executionCount: 0,
  },
  {
    id: "auto-8",
    name: "Horario óptimo → Enviar mensajes en cola",
    trigger: { type: "time_based", config: { hours: [9, 10, 14, 17], days: ["mon", "tue", "wed", "thu", "fri"] } },
    conditions: [],
    actions: [
      { type: "create_task", config: { type: "process_queue", batch: 5 } },
    ],
    isActive: true,
    executionCount: 340,
  },
];

// Execute automation logic
export function evaluateConditions(
  conditions: AutomationCondition[],
  context: Record<string, unknown>
): boolean {
  if (conditions.length === 0) return true;

  return conditions.every((condition) => {
    const fieldValue = context[condition.field];

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "not_equals":
        return fieldValue !== condition.value;
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case "greater_than":
        return Number(fieldValue) > Number(condition.value);
      case "less_than":
        return Number(fieldValue) < Number(condition.value);
      case "in_list":
        return Array.isArray(condition.value) && condition.value.includes(String(fieldValue));
      default:
        return false;
    }
  });
}

// Smart tag suggestions based on contact data
export function suggestTags(contact: {
  network: string;
  company?: string;
  jobTitle?: string;
  status: string;
  score: number;
}): string[] {
  const tags: string[] = [];

  // Network tag
  tags.push(contact.network);

  // Score-based tags
  if (contact.score >= 80) tags.push("hot_lead", "priority");
  else if (contact.score >= 50) tags.push("warm_lead");
  else tags.push("cold_lead");

  // Role-based tags
  if (contact.jobTitle) {
    const title = contact.jobTitle.toLowerCase();
    if (title.includes("ceo") || title.includes("founder") || title.includes("owner")) tags.push("decision_maker", "c_level");
    if (title.includes("marketing") || title.includes("growth")) tags.push("marketing");
    if (title.includes("tech") || title.includes("cto") || title.includes("developer")) tags.push("tech");
    if (title.includes("sales") || title.includes("business")) tags.push("sales");
  }

  // Status tag
  if (contact.status === "converted") tags.push("client");
  if (contact.status === "replied") tags.push("engaged");

  return [...new Set(tags)];
}
