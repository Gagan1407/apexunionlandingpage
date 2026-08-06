/** Shared enrollment pipeline statuses for Admin + Sheet sync. */
export const ENROLLMENT_STATUSES = [
  "New",
  "Contacted",
  "Pending Enrollment",
  "Enrolled",
  "Not Interested",
] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const DEFAULT_ENROLLMENT_STATUS: EnrollmentStatus = "New";

const STATUS_ALIASES: Record<string, EnrollmentStatus> = {
  new: "New",
  contacted: "Contacted",
  "pending enrollment": "Pending Enrollment",
  pending: "Pending Enrollment",
  enrolled: "Enrolled",
  "not interested": "Not Interested",
  declined: "Not Interested",
};

export function normalizeEnrollmentStatus(
  value: unknown
): EnrollmentStatus | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const exact = ENROLLMENT_STATUSES.find((s) => s === raw);
  if (exact) return exact;

  return STATUS_ALIASES[raw.toLowerCase()] ?? null;
}

export function countEnrollmentMetrics(
  leads: Array<{ enrollment_status?: string | null }>
) {
  const total = leads.length;
  let pending = 0;
  let enrolled = 0;
  let contacted = 0;
  let notInterested = 0;
  let neu = 0;

  for (const lead of leads) {
    const status =
      normalizeEnrollmentStatus(lead.enrollment_status) ||
      DEFAULT_ENROLLMENT_STATUS;

    switch (status) {
      case "Pending Enrollment":
        pending += 1;
        break;
      case "Enrolled":
        enrolled += 1;
        break;
      case "Contacted":
        contacted += 1;
        break;
      case "Not Interested":
        notInterested += 1;
        break;
      default:
        neu += 1;
        break;
    }
  }

  const conversionPct = total === 0 ? 0 : Math.round((enrolled / total) * 100);

  return {
    total,
    new: neu,
    contacted,
    pending,
    enrolled,
    notInterested,
    conversionPct,
  };
}
