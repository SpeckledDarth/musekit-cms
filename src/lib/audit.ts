import { getBrowserClient } from "./supabase";

interface AuditLogEntry {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  details?: Record<string, unknown>;
}

export function auditLog({ action, entity, entityId, userId, details }: AuditLogEntry): void {
  try {
    const supabase = getBrowserClient();
    supabase
      .from("audit_logs")
      .insert({
        action,
        entity,
        entity_id: entityId || null,
        user_id: userId || null,
        details: details || null,
      })
      .then(({ error }) => {
        if (error) {
          console.warn("Audit log failed:", error.message);
        }
      });
  } catch (err) {
    console.warn("Audit log error:", err);
  }
}
