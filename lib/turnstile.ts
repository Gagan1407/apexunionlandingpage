/** Public Turnstile site key (safe in the browser). */
export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
}

export type TurnstileApi = {
  render: (
    container: string | HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

export function readTurnstileToken(form: HTMLFormElement) {
  const hidden = form.querySelector<HTMLInputElement>(
    'input[name="turnstileToken"]'
  );
  if (hidden?.value.trim()) return hidden.value.trim();

  const cf = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    '[name="cf-turnstile-response"]'
  );
  return cf?.value.trim() || "";
}

export function resetTurnstileInForm(form: HTMLFormElement) {
  const widgetId = form.dataset.turnstileWidgetId;
  if (widgetId && window.turnstile) {
    window.turnstile.reset(widgetId);
  }
  const hidden = form.querySelector<HTMLInputElement>(
    'input[name="turnstileToken"]'
  );
  if (hidden) hidden.value = "";
}
