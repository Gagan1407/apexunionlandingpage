"use client";

import { useEffect, useRef, useState } from "react";
import { getTurnstileSiteKey } from "@/lib/turnstile";

type TurnstileFieldProps = {
  /** Unique element id for this widget instance */
  containerId: string;
  /** Form id that owns this widget (used to store widget id + token) */
  formId: string;
  theme?: "light" | "dark" | "auto";
  /**
   * If set, wait until this element is visible (not [hidden]) before rendering.
   * Required for widgets inside the lead modal.
   */
  visibleRootId?: string;
};

let scriptLoading: Promise<void> | null = null;

function loadTurnstileScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-apex-turnstile]'
    );
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Turnstile failed to load"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.apexTurnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

function isElementVisible(el: HTMLElement | null) {
  if (!el) return false;
  if (el.hidden) return false;
  if (el.getAttribute("hidden") !== null && el.hidden !== false) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return true;
}

export default function TurnstileField({
  containerId,
  formId,
  theme = "light",
  visibleRootId,
}: TurnstileFieldProps) {
  const siteKey = getTurnstileSiteKey();
  const [canRender, setCanRender] = useState(!visibleRootId);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!visibleRootId) return;
    const root = document.getElementById(visibleRootId);
    if (!root) return;

    const sync = () => {
      const visible = isElementVisible(root);
      // Defer so we don't sync-setState in the effect body (React Compiler lint).
      queueMicrotask(() => {
        if (!cancelled) setCanRender(visible);
      });
    };
    let cancelled = false;
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["hidden", "class", "style"],
    });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [visibleRootId]);

  useEffect(() => {
    if (!siteKey || !canRender) return;
    let cancelled = false;

    async function mount() {
      try {
        await loadTurnstileScript();
        if (cancelled || !window.turnstile) return;

        const container = document.getElementById(containerId);
        const form = document.getElementById(formId) as HTMLFormElement | null;
        const tokenInput = form?.querySelector<HTMLInputElement>(
          'input[name="turnstileToken"]'
        );
        if (!container || !form || !tokenInput) return;

        // Avoid double-render into the same node (React Strict Mode).
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
          container.innerHTML = "";
        }

        const widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => {
            tokenInput.value = token;
          },
          "expired-callback": () => {
            tokenInput.value = "";
          },
          "error-callback": () => {
            tokenInput.value = "";
          },
        });

        widgetIdRef.current = widgetId;
        form.dataset.turnstileWidgetId = widgetId;
      } catch (err) {
        console.error(err);
      }
    }

    void mount();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
      const form = document.getElementById(formId) as HTMLFormElement | null;
      const tokenInput = form?.querySelector<HTMLInputElement>(
        'input[name="turnstileToken"]'
      );
      if (tokenInput) tokenInput.value = "";
    };
  }, [canRender, containerId, formId, siteKey, theme]);

  if (!siteKey) return null;

  return (
    <div className="turnstile-field">
      <input type="hidden" name="turnstileToken" defaultValue="" />
      {canRender ? (
        <div id={containerId} className="turnstile-widget" />
      ) : (
        <p className="turnstile-pending">Security check loads when you open Apply.</p>
      )}
    </div>
  );
}
