import { createNotification, getOwnerByTenant } from "../db";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Dispatches a project-owner notification by writing directly to the
 * `notifications` table. Returns `true` if the notification was recorded,
 * `false` if the tenant has no owner user or the payload was invalid.
 */
export async function notifyOwner(
  payload: NotificationPayload & {
    tenantId: number;
    appointmentId?: number;
    type?: "new_booking" | "booking_modified" | "booking_cancelled" | "reminder" | "system";
  }
): Promise<boolean> {
  const { title, content, tenantId, appointmentId, type } = payload;

  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    console.warn("[Notification] Missing title or content; skipping.");
    return false;
  }
  if (title.length > TITLE_MAX_LENGTH || content.length > CONTENT_MAX_LENGTH) {
    console.warn("[Notification] Title or content too long; skipping.");
    return false;
  }

  const owner = await getOwnerByTenant(tenantId);
  if (!owner) {
    console.warn(`[Notification] No owner found for tenant ${tenantId}; skipping.`);
    return false;
  }

  try {
    await createNotification({
      tenantId,
      userId: owner.id,
      appointmentId: appointmentId ?? null,
      type: type ?? "system",
      title: title.trim(),
      message: content.trim(),
      isRead: false,
      emailSent: false,
    });
    return true;
  } catch (error) {
    console.warn("[Notification] Error writing notification:", error);
    return false;
  }
}
