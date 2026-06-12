const aboutAssetData = [
  {
    title: "Live Campaigns",
    text: "Launch real strategies that drive actual growth.",
    gradient: ["#320000", "#4d0000"],
    gradientActive: ["#4d0000", "#7a1a1a"],
    accent: "#4d0000",
  },
  {
    title: "Sales Exercises",
    text: "Pitch, negotiate, and close deals live.",
    gradient: ["#4d0000", "#6b1414"],
    gradientActive: ["#6b1414", "#943030"],
    accent: "#6b1414",
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
    gradient: ["#3a0000", "#5c0000"],
    gradientActive: ["#5c0000", "#8a2a2a"],
    accent: "#5c0000",
  },
  {
    title: "Pro-Critiqued Projects",
    text: "Get feedback directly from active industry leaders.",
    gradient: ["#8a6a2c", "#d4b76a"],
    gradientActive: ["#c9a84c", "#f8efd0"],
    accent: "#a87820",
  },
];

function createSvgGradient(defsEl, id, stops, angle = 135) {
  const rad = (angle * Math.PI) / 180;
  const x1 = 50 - Math.cos(rad) * 50;
  const y1 = 50 - Math.sin(rad) * 50;
  const x2 = 50 + Math.cos(rad) * 50;
  const y2 = 50 + Math.sin(rad) * 50;
  const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
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

function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeDonutSegment(cx, cy, outerR, innerR, startAngle, endAngle) {
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

const assetsWheel = document.querySelector("[data-assets-wheel]");

if (assetsWheel) {
  const segmentsGroup = assetsWheel.querySelector("[data-assets-segments]");
  const gradientsHost = assetsWheel.querySelector("[data-assets-gradients]");
  const detailPanel = assetsWheel.querySelector("[data-assets-detail]");
  const detailTitle = assetsWheel.querySelector("[data-assets-title]");
  const detailText = assetsWheel.querySelector("[data-assets-text]");
  const chartStep = assetsWheel.querySelector("[data-assets-step]");
  const chartHint = assetsWheel.querySelector(".about-assets-chart-hint");
  const legendItems = [...assetsWheel.querySelectorAll("[data-asset-index]")];
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const idleHint = supportsHover ? "Hover a segment" : "Tap a category";
  assetsWheel.dataset.inputMode = supportsHover ? "hover" : "touch";
  const cx = 120;
  const cy = 120;
  const outerR = 100;
  const innerR = 58;
  const gap = 2.5;
  const segmentAngle = 360 / aboutAssetData.length;
  let isHovering = false;

  aboutAssetData.forEach((asset, index) => {
    if (!gradientsHost) return;
    createSvgGradient(gradientsHost, `asset-grad-${index}`, asset.gradient, 125 + index * 18);
    createSvgGradient(
      gradientsHost,
      `asset-grad-${index}-active`,
      asset.gradientActive,
      125 + index * 18
    );
  });

  function setActiveAsset(index, options = {}) {
    const { hovered = false, reset = false } = options;
    if (index < 0 || index >= aboutAssetData.length) return;

    isHovering = hovered;
    const asset = aboutAssetData[index];
    const isIdle = reset || (!hovered && index === 0);

    assetsWheel.classList.toggle("is-idle", isIdle);

    assetsWheel.querySelectorAll(".about-assets-segment").forEach((segment, segmentIndex) => {
      const isActive = segmentIndex === index && !isIdle;
      segment.classList.toggle("is-active", isActive);
      const pathEl = segment.querySelector("path");
      if (pathEl) {
        pathEl.setAttribute(
          "fill",
          isActive ? `url(#asset-grad-${segmentIndex}-active)` : `url(#asset-grad-${segmentIndex})`
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

  function bindAssetTrigger(element, index) {
    const activate = (hovered) => setActiveAsset(index, { hovered });

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

  assetsWheel.addEventListener("mouseleave", () => {
    if (!supportsHover) return;
    setActiveAsset(0, { reset: true });
  });

  if (supportsHover) {
    setActiveAsset(0, { reset: true });
  } else {
    setActiveAsset(0, { hovered: true });
  }
}

const trackTabs = document.querySelectorAll(".track-tab");
const trackPanels = document.querySelectorAll(".track-panel");

function setActiveTrack(tab) {
  const panelId = tab.getAttribute("aria-controls");

  trackTabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  trackPanels.forEach((panel) => {
    const isActive = panel.id === panelId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

trackTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveTrack(tab);
  });

  tab.addEventListener("mouseenter", () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setActiveTrack(tab);
    }
  });
});

const PHONE_LENGTH_RULES = {
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

function getCountryCodes() {
  return window.APEX_COUNTRY_CODES || [];
}

function initCountryCodeSelects() {
  const countries = getCountryCodes();
  if (!countries.length) return;

  document.querySelectorAll("[data-country-code-select]").forEach((select) => {
    if (select.options.length > 0) return;

    countries.forEach(({ country, code }) => {
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

function updateCountryCodeDisplay(select) {
  const selected = select.selectedOptions[0];
  const country = selected?.dataset.country || "";
  const display = select.closest(".phone-code-field")?.querySelector(".phone-code-display");

  if (display) display.textContent = select.value;
  select.title = country ? `${country} (${select.value})` : select.value;
}

function normalizePhoneLocal(countryCode, rawInput) {
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

function validatePhoneNumber(countryCode, digits) {
  if (!digits) return false;

  const rule = PHONE_LENGTH_RULES[countryCode];
  if (rule?.length) return digits.length === rule.length;
  if (rule?.minLength && rule?.maxLength) {
    return digits.length >= rule.minLength && digits.length <= rule.maxLength;
  }

  return digits.length >= 4 && digits.length <= 15;
}

function getLeadFormValidationMessage(fields) {
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

function readLeadFormFields(form) {
  const name = form.elements.namedItem("name")?.value.trim() || "";
  const email = form.elements.namedItem("email")?.value.trim() || "";
  const countryCode = form.elements.namedItem("countryCode")?.value || "+91";
  const phoneLocal = normalizePhoneLocal(
    countryCode,
    form.elements.namedItem("phone")?.value || ""
  );
  const track = form.elements.namedItem("track")?.value || "";
  const status = form.elements.namedItem("status")?.value || "";
  const source = form.elements.namedItem("source")?.value || "unknown";

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

initCountryCodeSelects();

function saveLeadLocally(leadPayload) {
  const existingLeads = JSON.parse(localStorage.getItem("apex_union_leads") || "[]");
  existingLeads.push(leadPayload);
  localStorage.setItem("apex_union_leads", JSON.stringify(existingLeads));
}

function getGoogleSheetWebAppUrl() {
  return (window.APEX_CONFIG && window.APEX_CONFIG.GOOGLE_SHEET_WEB_APP_URL) || "";
}

function submitLeadViaHiddenForm(webhookUrl, leadPayload) {
  const iframeName = `apex-lead-iframe-${Date.now()}`;
  const iframe = document.createElement("iframe");
  iframe.name = iframeName;
  iframe.hidden = true;
  iframe.style.cssText = "display:none;width:0;height:0;border:0";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = webhookUrl;
  form.target = iframeName;
  form.style.display = "none";

  Object.entries(leadPayload).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value ?? "";
    form.appendChild(input);
  });

  document.body.appendChild(iframe);
  document.body.appendChild(form);
  form.submit();

  window.setTimeout(() => {
    form.remove();
    iframe.remove();
  }, 10000);
}

function syncLeadToGoogleSheet(webhookUrl, leadPayload) {
  const body = new URLSearchParams(leadPayload);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4000);

  fetch(webhookUrl, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    keepalive: true,
    body,
    signal: controller.signal,
  })
    .then(async (response) => {
      let result = { ok: response.ok };
      try {
        result = await response.json();
      } catch {
        // Apps Script may return HTML on redirect; treat non-error responses as success
      }

      if (!response.ok || result.ok === false) {
        submitLeadViaHiddenForm(webhookUrl, leadPayload);
      }
    })
    .catch(() => {
      submitLeadViaHiddenForm(webhookUrl, leadPayload);
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
    });
}

async function submitLead(leadPayload) {
  saveLeadLocally(leadPayload);

  const webhookUrl = getGoogleSheetWebAppUrl();
  if (webhookUrl) {
    syncLeadToGoogleSheet(webhookUrl, leadPayload);
  }

  return { ok: true };
}

const leadModal = document.querySelector("#lead-modal");
const leadForm = document.querySelector("#lead-form");
const leadFormMessage = document.querySelector("#lead-form-message");
const leadSourceInput = document.querySelector("#lead-source");
const leadModalTriggers = document.querySelectorAll('a[href="#apply"]');
const closeLeadModalButtons = document.querySelectorAll("[data-close-lead-modal]");
const mobileSidebar = document.querySelector("#mobile-sidebar");
const openMobileNavButton = document.querySelector("[data-open-mobile-nav]");
const closeMobileNavButtons = document.querySelectorAll("[data-close-mobile-nav]");

function openLeadModal(source) {
  if (!leadModal) return;
  leadModal.hidden = false;
  document.body.classList.add("modal-open");
  if (leadSourceInput) leadSourceInput.value = source || "unknown";

  requestAnimationFrame(() => {
    const firstInput = leadForm?.querySelector("input, select");
    firstInput?.focus();
  });
}

function closeLeadModal() {
  if (!leadModal) return;
  leadModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function openMobileNav() {
  if (!mobileSidebar) return;
  mobileSidebar.hidden = false;
  document.body.classList.add("nav-open");
  if (openMobileNavButton) openMobileNavButton.setAttribute("aria-expanded", "true");
}

function closeMobileNav() {
  if (!mobileSidebar) return;
  mobileSidebar.hidden = true;
  document.body.classList.remove("nav-open");
  if (openMobileNavButton) openMobileNavButton.setAttribute("aria-expanded", "false");
}

if (openMobileNavButton) {
  openMobileNavButton.addEventListener("click", openMobileNav);
}

closeMobileNavButtons.forEach((button) => {
  button.addEventListener("click", closeMobileNav);
});

leadModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    if (trigger.hasAttribute("data-close-mobile-nav")) closeMobileNav();
    event.preventDefault();
    openLeadModal(trigger.dataset.leadSource || "apply-cta");
  });
});

closeLeadModalButtons.forEach((button) => {
  button.addEventListener("click", closeLeadModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileSidebar && !mobileSidebar.hidden) {
    closeMobileNav();
  }
  if (event.key === "Escape" && leadModal && !leadModal.hidden) {
    closeLeadModal();
  }
});

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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
    };

    const submitButton = leadForm.querySelector(".lead-submit");
    if (submitButton) submitButton.disabled = true;
    leadFormMessage.classList.remove("is-error");

    try {
      await submitLead(leadPayload);
      leadFormMessage.textContent = "Thanks! Your application has been received.";
      leadForm.reset();
      const leadCountryCode = leadForm.querySelector("[data-country-code-select]");
      if (leadCountryCode) updateCountryCodeDisplay(leadCountryCode);
      setTimeout(() => {
        closeLeadModal();
        leadFormMessage.textContent = "";
      }, 1100);
    } catch (error) {
      leadFormMessage.textContent =
        error.message || "Something went wrong. Please try again.";
      leadFormMessage.classList.add("is-error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const faqAccordion = document.querySelector("[data-faq-accordion]");

if (faqAccordion) {
  const faqToggles = faqAccordion.querySelectorAll(".faq-toggle");

  faqToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panelId = toggle.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      panel.hidden = isExpanded;
    });
  });
}

const inlineLeadForm = document.querySelector("#inline-lead-form");
const inlineLeadMessage = document.querySelector("#inline-lead-message");

if (inlineLeadForm && inlineLeadMessage) {
  inlineLeadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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
    };

    const submitButton = inlineLeadForm.querySelector(".enroll-submit");
    if (submitButton) submitButton.disabled = true;
    inlineLeadMessage.classList.remove("is-error");

    try {
      await submitLead(leadPayload);
      inlineLeadMessage.textContent =
        "Great! You're in. Our team will share cohort details shortly.";
      inlineLeadForm.reset();
      const inlineCountryCode = inlineLeadForm.querySelector("[data-country-code-select]");
      if (inlineCountryCode) updateCountryCodeDisplay(inlineCountryCode);
    } catch (error) {
      inlineLeadMessage.textContent =
        error.message || "Something went wrong. Please try again.";
      inlineLeadMessage.classList.add("is-error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const animatedSections = document.querySelectorAll(
  ".hero, .partners, .truth-section, .about-apex-section, .programme-structure-section, .founders-section, .mentors-section, .graduates-section, .comparison-section, .audience-section, .admission-section, .enroll-section, .faq-section"
);
const reduceMotionForReveal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (animatedSections.length > 0 && !reduceMotionForReveal) {
  animatedSections.forEach((section) => section.classList.add("animate-in"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  animatedSections.forEach((section) => revealObserver.observe(section));
} else {
  animatedSections.forEach((section) => section.classList.add("is-visible"));
}
