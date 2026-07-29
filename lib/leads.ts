import { getSubmitLeadUrl, getSupabaseAnonKey } from "@/lib/public-env";

export type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  track: string;
  status: string;
  source: string;
  submittedAt: string;
};

export type LeadFormFields = {
  name: string;
  email: string;
  phone: string;
  phoneLocal: string;
  countryCode: string;
  track: string;
  status: string;
  source: string;
  isEmailValid: boolean;
  isPhoneValid: boolean;
  isComplete: boolean;
};

const PHONE_LENGTH_RULES: Record<
  string,
  { length?: number; minLength?: number; maxLength?: number }
> = {
  "+91": { length: 10 },
  "+1": { length: 10 },
  "+44": { minLength: 10, maxLength: 11 },
  "+971": { length: 9 },
  "+966": { length: 9 },
  "+65": { length: 8 },
  "+61": { length: 9 },
  "+49": { minLength: 10, maxLength: 11 },
  "+33": { length: 9 },
  "+81": { minLength: 10, maxLength: 11 },
  "+86": { length: 11 },
};

export function normalizePhoneLocal(countryCode: string, rawInput: string) {
  let digits = rawInput.trim().replace(/\D/g, "");
  if (!digits) return "";

  const codeDigits = countryCode.replace(/\D/g, "");
  if (digits.startsWith(codeDigits) && digits.length > codeDigits.length + 3) {
    digits = digits.slice(codeDigits.length);
  }

  if (countryCode === "+91" && digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

export function validatePhoneNumber(countryCode: string, digits: string) {
  if (!digits) return false;

  const rule = PHONE_LENGTH_RULES[countryCode];
  if (rule?.length) return digits.length === rule.length;
  if (rule?.minLength && rule?.maxLength) {
    return digits.length >= rule.minLength && digits.length <= rule.maxLength;
  }

  return digits.length >= 4 && digits.length <= 15;
}

export function getLeadFormValidationMessage(fields: LeadFormFields) {
  if (!fields.name) return "Please enter your full name.";
  if (!fields.isEmailValid) return "Please enter a valid email address.";
  if (!fields.phoneLocal) return "Please enter your WhatsApp number.";
  if (!fields.isPhoneValid) {
    return `Please enter a valid WhatsApp number for ${fields.countryCode} (numbers only, no spaces).`;
  }
  if (!fields.track) return "Please select a track.";
  if (!fields.status) return "Please select your current status.";
  return "Please fill in all fields with valid details.";
}

export function readLeadFormFields(form: HTMLFormElement): LeadFormFields {
  const get = (name: string) => {
    const el = form.elements.namedItem(name);
    if (!el) return "";
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      return el.value;
    }
    return "";
  };

  const name = get("name").trim();
  const email = get("email").trim();
  const countryCode = get("countryCode") || "+91";
  const phoneLocal = normalizePhoneLocal(countryCode, get("phone"));
  const track = get("track");
  const status = get("status");
  const source = get("source") || "unknown";

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = validatePhoneNumber(countryCode, phoneLocal);
  const phone = phoneLocal ? `${countryCode} ${phoneLocal}` : "";

  return {
    name,
    email,
    phone,
    phoneLocal,
    countryCode,
    track,
    status,
    source,
    isEmailValid,
    isPhoneValid,
    isComplete: Boolean(name && isEmailValid && isPhoneValid && track && status),
  };
}

async function syncLeadToEdgeFunction(
  submitUrl: string,
  leadPayload: LeadPayload
) {
  const anon = getSupabaseAnonKey();
  const response = await fetch(submitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anon
        ? {
            apikey: anon,
            Authorization: `Bearer ${anon}`,
          }
        : {}),
    },
    body: JSON.stringify(leadPayload),
  });

  let result: { ok?: boolean; error?: string } = { ok: response.ok };
  try {
    result = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok || result.ok === false) {
    throw new Error(result.error || "Something went wrong. Please try again.");
  }
}

export async function submitLead(leadPayload: LeadPayload) {
  const submitUrl = getSubmitLeadUrl();
  if (!submitUrl) {
    throw new Error(
      "Lead submission is not configured. Set NEXT_PUBLIC_SUPABASE_URL (or NEXT_PUBLIC_SUBMIT_LEAD_URL) in your host env vars and redeploy."
    );
  }

  await syncLeadToEdgeFunction(submitUrl, leadPayload);
  return { ok: true as const };
}
