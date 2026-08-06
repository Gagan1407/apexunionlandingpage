"use client";

import { useEffect } from "react";
import { APEX_COUNTRY_CODES } from "@/lib/country-codes";
import {
  getLeadFormValidationMessage,
  readLeadFormFields,
  submitLead,
} from "@/lib/leads";
import { readTurnstileToken, resetTurnstileInForm } from "@/lib/turnstile";

const aboutAssetData = [
  {
    title: "Live Campaigns",
    text: "Launch real strategies that drive actual growth.",
    gradient: ["#32090a", "#510f11"],
    gradientActive: ["#510f11", "#7a2426"],
    accent: "#510f11",
  },
  {
    title: "Sales Exercises",
    text: "Pitch, negotiate, and close deals live.",
    gradient: ["#510f11", "#6b1e20"],
    gradientActive: ["#6b1e20", "#943030"],
    accent: "#6b1e20",
  },
  {
    title: "High-Impact Presentations",
    text: "Command rooms like a seasoned executive.",
    gradient: ["#a87820", "#c9a84c"],
    gradientActive: ["#c9a84c", "#f2d78d"],
    accent: "#c9a84c",
  },
  {
    title: "Portfolio Assets",
    text: "Create production-quality case studies.",
    gradient: ["#3a0b0c", "#5c1518"],
    gradientActive: ["#5c1518", "#8a2a2a"],
    accent: "#5c1518",
  },
  {
    title: "Pro-Critiqued Projects",
    text: "Get feedback directly from active industry leaders.",
    gradient: ["#8a6a2c", "#d4b76a"],
    gradientActive: ["#c9a84c", "#f8efd0"],
    accent: "#a87820",
  },
];

function createSvgGradient(
  defsEl: SVGDefsElement,
  id: string,
  stops: string[],
  angle = 135
) {
  const rad = (angle * Math.PI) / 180;
  const x1 = 50 - Math.cos(rad) * 50;
  const y1 = 50 - Math.sin(rad) * 50;
  const x2 = 50 + Math.cos(rad) * 50;
  const y2 = 50 + Math.sin(rad) * 50;
  const gradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  gradient.setAttribute("id", id);
  gradient.setAttribute("x1", `${x1}%`);
  gradient.setAttribute("y1", `${y1}%`);
  gradient.setAttribute("x2", `${x2}%`);
  gradient.setAttribute("y2", `${y2}%`);

  stops.forEach((color, index) => {
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", index === 0 ? "0%" : "100%");
    stop.setAttribute("stop-color", color);
    gradient.appendChild(stop);
  });

  defsEl.appendChild(gradient);
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function updateCountryCodeDisplay(select: HTMLSelectElement) {
  const selected = select.selectedOptions[0];
  const country = selected?.dataset.country || "";
  const display = select
    .closest(".phone-code-field")
    ?.querySelector(".phone-code-display");

  if (display) display.textContent = select.value;
  select.title = country ? `${country} (${select.value})` : select.value;
}

function initCountryCodeSelects() {
  document.querySelectorAll<HTMLSelectElement>("[data-country-code-select]").forEach((select) => {
    if (select.options.length > 0) return;

    APEX_COUNTRY_CODES.forEach(({ country, code }) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${country} (${code})`;
      option.dataset.country = country;
      select.appendChild(option);
    });

    select.value = "+91";
    updateCountryCodeDisplay(select);
    select.addEventListener("change", () => updateCountryCodeDisplay(select));
  });
}

function initAssetsWheel() {
  const assetsWheel = document.querySelector<HTMLElement>("[data-assets-wheel]");
  if (!assetsWheel) return () => {};

  const segmentsGroup = assetsWheel.querySelector("[data-assets-segments]");
  const gradientsHost = assetsWheel.querySelector<SVGDefsElement>(
    "[data-assets-gradients]"
  );
  const detailPanel = assetsWheel.querySelector<HTMLElement>("[data-assets-detail]");
  const detailTitle = assetsWheel.querySelector("[data-assets-title]");
  const detailText = assetsWheel.querySelector("[data-assets-text]");
  const chartStep = assetsWheel.querySelector("[data-assets-step]");
  const chartHint = assetsWheel.querySelector(".about-assets-chart-hint");
  const legendItems = [
    ...assetsWheel.querySelectorAll<HTMLElement>("[data-asset-index]"),
  ];
  const supportsHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const idleHint = supportsHover ? "Hover a segment" : "Tap a category";
  assetsWheel.dataset.inputMode = supportsHover ? "hover" : "touch";
  const cx = 120;
  const cy = 120;
  const outerR = 100;
  const innerR = 58;
  const gap = 2.5;
  const segmentAngle = 360 / aboutAssetData.length;

  aboutAssetData.forEach((asset, index) => {
    if (!gradientsHost) return;
    createSvgGradient(
      gradientsHost,
      `asset-grad-${index}`,
      asset.gradient,
      125 + index * 18
    );
    createSvgGradient(
      gradientsHost,
      `asset-grad-${index}-active`,
      asset.gradientActive,
      125 + index * 18
    );
  });

  function setActiveAsset(
    index: number,
    options: { hovered?: boolean; reset?: boolean } = {}
  ) {
    const { hovered = false, reset = false } = options;
    if (index < 0 || index >= aboutAssetData.length) return;

    const asset = aboutAssetData[index];
    const isIdle = reset || (!hovered && index === 0);

    assetsWheel!.classList.toggle("is-idle", isIdle);

    assetsWheel!.querySelectorAll(".about-assets-segment").forEach((segment, segmentIndex) => {
      const isActive = segmentIndex === index && !isIdle;
      segment.classList.toggle("is-active", isActive);
      const pathEl = segment.querySelector("path");
      if (pathEl) {
        pathEl.setAttribute(
          "fill",
          isActive
            ? `url(#asset-grad-${segmentIndex}-active)`
            : `url(#asset-grad-${segmentIndex})`
        );
      }
    });

    legendItems.forEach((item) => {
      const itemIndex = Number(item.dataset.assetIndex);
      item.classList.toggle("is-active", itemIndex === index && !isIdle);
    });

    if (detailPanel) {
      detailPanel.classList.add("is-updating");
      detailPanel.style.setProperty("--asset-accent", asset.accent);
    }
    if (chartStep) chartStep.textContent = String(index + 1).padStart(2, "0");
    if (chartHint) chartHint.textContent = isIdle ? idleHint : asset.title;
    if (detailTitle) detailTitle.textContent = asset.title;
    if (detailText) detailText.textContent = asset.text;

    requestAnimationFrame(() => {
      detailPanel?.classList.remove("is-updating");
    });
  }

  function bindAssetTrigger(element: Element, index: number) {
    const activate = (hovered: boolean) => setActiveAsset(index, { hovered });

    if (supportsHover) {
      element.addEventListener("mouseenter", () => activate(true));
    } else {
      element.addEventListener("click", () => activate(true));
    }

    element.addEventListener("focusin", () => activate(true));
  }

  if (segmentsGroup) {
    aboutAssetData.forEach((asset, index) => {
      const startAngle = -90 + index * segmentAngle + gap / 2;
      const endAngle = -90 + (index + 1) * segmentAngle - gap / 2;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        describeDonutSegment(cx, cy, outerR, innerR, startAngle, endAngle)
      );
      path.setAttribute("fill", `url(#asset-grad-${index})`);

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.classList.add("about-assets-segment");
      group.dataset.assetIndex = String(index);
      group.setAttribute("tabindex", "0");
      group.setAttribute("aria-label", `${asset.title}: ${asset.text}`);
      group.appendChild(path);
      segmentsGroup.appendChild(group);

      bindAssetTrigger(group, index);
    });
  }

  legendItems.forEach((item) => {
    bindAssetTrigger(item, Number(item.dataset.assetIndex));
  });

  const onLeave = () => {
    if (!supportsHover) return;
    setActiveAsset(0, { reset: true });
  };
  assetsWheel.addEventListener("mouseleave", onLeave);

  if (supportsHover) {
    setActiveAsset(0, { reset: true });
  } else {
    setActiveAsset(0, { hovered: true });
  }

  return () => {
    assetsWheel.removeEventListener("mouseleave", onLeave);
  };
}

export default function InteractiveBehaviors() {
  useEffect(() => {
    initCountryCodeSelects();
    const cleanupWheel = initAssetsWheel();

    const leadModal = document.querySelector<HTMLElement>("#lead-modal");
    const leadForm = document.querySelector<HTMLFormElement>("#lead-form");
    const leadFormMessage = document.querySelector("#lead-form-message");
    const leadSourceInput = document.querySelector<HTMLInputElement>("#lead-source");
    const leadModalTriggers = document.querySelectorAll<HTMLAnchorElement>(
      'a[href="#apply"]'
    );
    const closeLeadModalButtons = document.querySelectorAll(
      "[data-close-lead-modal]"
    );
    const mobileSidebar = document.querySelector<HTMLElement>("#mobile-sidebar");
    const openMobileNavButton = document.querySelector<HTMLElement>(
      "[data-open-mobile-nav]"
    );
    const closeMobileNavButtons = document.querySelectorAll(
      "[data-close-mobile-nav]"
    );
    let lastFocusBeforeModal: HTMLElement | null = null;
    let lastFocusBeforeNav: HTMLElement | null = null;
    let leadModalVariant: "apply" | "consult" = "apply";

    const FOCUSABLE =
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function trapFocus(container: HTMLElement, event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function setLeadSubmitLabel(variant: "apply" | "consult") {
      const submitButton = leadForm?.querySelector<HTMLButtonElement>(".lead-submit");
      if (!submitButton) return;
      const applyLabel =
        submitButton.dataset.labelApply || "Submit Application";
      const consultLabel =
        submitButton.dataset.labelConsult || "Book Consultation";
      submitButton.textContent =
        variant === "consult" ? consultLabel : applyLabel;
    }

    function openLeadModal(source: string, variant?: string | null) {
      if (!leadModal) return;
      lastFocusBeforeModal = document.activeElement as HTMLElement | null;
      leadModal.hidden = false;
      document.body.classList.add("modal-open");
      if (leadSourceInput) leadSourceInput.value = source || "unknown";

      const title = leadModal.querySelector("#lead-modal-title");
      const subtitle = leadModal.querySelector(".lead-modal-subtitle");
      const normalized = `${source || ""} ${variant || ""}`.toLowerCase();
      const isConsult =
        normalized.includes("consult") || variant === "consult";
      leadModalVariant = isConsult ? "consult" : "apply";
      setLeadSubmitLabel(leadModalVariant);

      if (title) {
        title.innerHTML = isConsult
          ? 'Book your <span class="career-kalam">Free Consultation</span>'
          : 'Your Career in <span class="career-kalam">Sales</span> &amp; <span class="career-kalam">Marketing</span> Starts Here';
      }
      if (subtitle) {
        subtitle.textContent = isConsult
          ? "Share your details and we'll set up a free career consultation."
          : "Share your details and our team will connect with you.";
      }

      if (leadFormMessage) {
        leadFormMessage.textContent = "";
        leadFormMessage.classList.remove("is-error");
      }

      requestAnimationFrame(() => {
        const firstInput = leadForm?.querySelector<HTMLElement>(
          "input:not([type='hidden']), select"
        );
        firstInput?.focus();
      });
    }

    function closeLeadModal() {
      if (!leadModal) return;
      leadModal.hidden = true;
      document.body.classList.remove("modal-open");
      leadModalVariant = "apply";
      setLeadSubmitLabel("apply");
      lastFocusBeforeModal?.focus?.();
      lastFocusBeforeModal = null;
    }

    function openMobileNav() {
      if (!mobileSidebar) return;
      lastFocusBeforeNav = document.activeElement as HTMLElement | null;
      mobileSidebar.hidden = false;
      document.body.classList.add("nav-open");
      if (openMobileNavButton)
        openMobileNavButton.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => {
        mobileSidebar
          .querySelector<HTMLElement>("a, button")
          ?.focus();
      });
    }

    function closeMobileNav() {
      if (!mobileSidebar) return;
      mobileSidebar.hidden = true;
      document.body.classList.remove("nav-open");
      if (openMobileNavButton)
        openMobileNavButton.setAttribute("aria-expanded", "false");
      lastFocusBeforeNav?.focus?.();
      lastFocusBeforeNav = null;
    }

    openMobileNavButton?.addEventListener("click", openMobileNav);
    closeMobileNavButtons.forEach((button) => {
      button.addEventListener("click", closeMobileNav);
    });

    const triggerCleanups: Array<() => void> = [];
    leadModalTriggers.forEach((trigger) => {
      const onClick = (event: Event) => {
        if (trigger.hasAttribute("data-close-mobile-nav")) closeMobileNav();
        event.preventDefault();
        const source =
          trigger.getAttribute("data-lead-source") ||
          trigger.dataset.leadSource ||
          "apply-cta";
        const variant =
          trigger.getAttribute("data-modal-variant") ||
          trigger.dataset.modalVariant ||
          null;
        openLeadModal(source, variant);
      };
      trigger.addEventListener("click", onClick);
      triggerCleanups.push(() => trigger.removeEventListener("click", onClick));
    });

    closeLeadModalButtons.forEach((button) => {
      button.addEventListener("click", closeLeadModal);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileSidebar && !mobileSidebar.hidden) {
        closeMobileNav();
      }
      if (event.key === "Escape" && leadModal && !leadModal.hidden) {
        closeLeadModal();
      }
      if (leadModal && !leadModal.hidden) {
        trapFocus(leadModal, event);
      } else if (mobileSidebar && !mobileSidebar.hidden) {
        trapFocus(mobileSidebar, event);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const onLeadSubmit = async (event: Event) => {
      event.preventDefault();
      if (!leadForm || !leadFormMessage) return;

      const fields = readLeadFormFields(leadForm);

      if (!fields.isComplete) {
        leadFormMessage.textContent = getLeadFormValidationMessage(fields);
        leadFormMessage.classList.add("is-error");
        return;
      }

      const leadPayload = {
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        countryCode: fields.countryCode,
        track: fields.track,
        status: fields.status,
        source: fields.source,
        submittedAt: new Date().toISOString(),
        turnstileToken: readTurnstileToken(leadForm),
      };

      const submitButton = leadForm.querySelector<HTMLButtonElement>(".lead-submit");
      const submitLabel = submitButton?.textContent || "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting…";
      }
      leadFormMessage.classList.remove("is-error");
      leadFormMessage.textContent = "";

      try {
        await submitLead(leadPayload);
        leadFormMessage.textContent =
          leadModalVariant === "consult"
            ? "Thanks! We'll reach out to schedule your free consultation."
            : "Thanks! Your application has been received.";
        leadForm.reset();
        resetTurnstileInForm(leadForm);
        const leadCountryCode = leadForm.querySelector<HTMLSelectElement>(
          "[data-country-code-select]"
        );
        if (leadCountryCode) {
          leadCountryCode.value = "+91";
          updateCountryCodeDisplay(leadCountryCode);
        }
        setTimeout(() => {
          closeLeadModal();
          leadFormMessage.textContent = "";
        }, 1100);
      } catch (error) {
        resetTurnstileInForm(leadForm);
        leadFormMessage.textContent =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";
        leadFormMessage.classList.add("is-error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitLabel || "Submit Application";
        }
      }
    };
    leadForm?.addEventListener("submit", onLeadSubmit);

    const faqAccordion = document.querySelector("[data-faq-accordion]");
    const faqCleanups: Array<() => void> = [];
    if (faqAccordion) {
      const faqToggles = faqAccordion.querySelectorAll(".faq-toggle");
      faqToggles.forEach((toggle) => {
        const onToggle = () => {
          const panelId = toggle.getAttribute("aria-controls");
          const panel = panelId ? document.getElementById(panelId) : null;
          if (!panel) return;

          const isExpanded = toggle.getAttribute("aria-expanded") === "true";
          toggle.setAttribute("aria-expanded", String(!isExpanded));
          panel.hidden = isExpanded;
        };
        toggle.addEventListener("click", onToggle);
        faqCleanups.push(() => toggle.removeEventListener("click", onToggle));
      });
    }

    const inlineLeadForm =
      document.querySelector<HTMLFormElement>("#inline-lead-form");
    const inlineLeadMessage = document.querySelector("#inline-lead-message");

    const onInlineSubmit = async (event: Event) => {
      event.preventDefault();
      if (!inlineLeadForm || !inlineLeadMessage) return;

      const fields = readLeadFormFields(inlineLeadForm);

      if (!fields.isComplete) {
        inlineLeadMessage.textContent = getLeadFormValidationMessage(fields);
        inlineLeadMessage.classList.add("is-error");
        return;
      }

      const leadPayload = {
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        countryCode: fields.countryCode,
        track: fields.track,
        status: fields.status,
        source: "inline-enroll-section",
        submittedAt: new Date().toISOString(),
        turnstileToken: readTurnstileToken(inlineLeadForm),
      };

      const submitButton =
        inlineLeadForm.querySelector<HTMLButtonElement>(".enroll-submit");
      const submitLabel = submitButton?.textContent || "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting…";
      }
      inlineLeadMessage.classList.remove("is-error");
      inlineLeadMessage.textContent = "";

      try {
        await submitLead(leadPayload);
        inlineLeadMessage.textContent =
          "Thanks — we received your details. Our team will be in touch shortly.";
        inlineLeadForm.reset();
        resetTurnstileInForm(inlineLeadForm);
        const inlineCountryCode = inlineLeadForm.querySelector<HTMLSelectElement>(
          "[data-country-code-select]"
        );
        if (inlineCountryCode) {
          inlineCountryCode.value = "+91";
          updateCountryCodeDisplay(inlineCountryCode);
        }
      } catch (error) {
        resetTurnstileInForm(inlineLeadForm);
        inlineLeadMessage.textContent =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";
        inlineLeadMessage.classList.add("is-error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitLabel || "Submit Application";
        }
      }
    };
    inlineLeadForm?.addEventListener("submit", onInlineSubmit);

    const animatedSections = document.querySelectorAll(
      ".hero, .partners, .truth-section, .about-apex-section, .programme-structure-section, .founders-section, .mentors-section, .comparison-section, .audience-section, .admission-section, .enroll-section, .faq-section"
    );
    const reduceMotionForReveal = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let revealObserver: IntersectionObserver | null = null;
    if (animatedSections.length > 0 && !reduceMotionForReveal) {
      animatedSections.forEach((section) => section.classList.add("animate-in"));

      // threshold 0 + rootMargin: tall sections (e.g. mentors) never reach 18%
      // visible on mobile/tablet, so they stayed opacity:0 indefinitely.
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { threshold: 0, rootMargin: "64px 0px -8% 0px" }
      );

      animatedSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const alreadyInView = rect.top < viewportHeight * 0.92 && rect.bottom > 0;
        if (alreadyInView) {
          section.classList.add("is-visible");
          return;
        }
        revealObserver!.observe(section);
      });
    } else {
      animatedSections.forEach((section) => section.classList.add("is-visible"));
    }

    return () => {
      cleanupWheel?.();
      openMobileNavButton?.removeEventListener("click", openMobileNav);
      closeMobileNavButtons.forEach((button) => {
        button.removeEventListener("click", closeMobileNav);
      });
      triggerCleanups.forEach((fn) => fn());
      closeLeadModalButtons.forEach((button) => {
        button.removeEventListener("click", closeLeadModal);
      });
      document.removeEventListener("keydown", onKeyDown);
      leadForm?.removeEventListener("submit", onLeadSubmit);
      faqCleanups.forEach((fn) => fn());
      inlineLeadForm?.removeEventListener("submit", onInlineSubmit);
      revealObserver?.disconnect();
    };
  }, []);

  return null;
}
