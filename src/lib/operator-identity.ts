// Single-operator identity only; not a substitute for multi-tenant sessions.
export function configuredOperatorId(): string | null {
  const id = process.env.PROSPECTOR_OPERATOR_USER_ID;
  return id && id !== "default-user" && /^[A-Za-z0-9_-]{3,128}$/.test(id) ? id : null;
}
