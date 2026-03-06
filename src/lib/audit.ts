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
    const mergedDetails: Record<string, unknown> = {
      entity,
      ...(entityId ? { entity_id: entityId } : {}),
      ...(details || {}),
    };
    supabase
      .from("audit_logs")
      .insert({
        action,
        user_id: userId || null,
        details: mergedDetails,
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
