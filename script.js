const truthBarrierData = [
  {
    symbol: "🎓",
    title: "The Degree Trap",
    copy: [
      'You spent 3-4 years on a degree.<br><strong>Companies still ask:</strong><br>"But can you sell?"',
      "<strong>MBA-style content, zero job outcomes.</strong><br>You learn slides and frameworks but can't prove execution in interviews.",
    ],
  },
  {
    symbol: "⛓️‍💥",
    title: "The Skills Gap",
    copy: [
      "College taught frameworks.<br>Not how to write a cold email,<br>run a discovery call, or<br>build a pipeline.",
      "<strong>Cold applications go nowhere.</strong><br>Without proof-of-work and referrals, resumes get ignored by recruiters.",
    ],
  },
  {
    symbol: "🚪🔒",
    title: "The Network Gap",
    copy: [
      "You don't know anyone at<br>the companies you want to<br>work at. No warm intros.<br>No insider access.",
      "<strong>You need a network, not just notes.</strong><br>Career growth is peer-driven and mentor-led, not solo YouTube learning.",
    ],
  },
];

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
    if (chartHint) chartHint.textContent = isIdle ? "Hover a segment" : asset.title;
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

  setActiveAsset(0, { reset: true });
}

const truthBarriers = document.querySelector("[data-truth-barriers]");

if (truthBarriers) {
  const tabs = Array.from(truthBarriers.querySelectorAll("[data-truth-tab]"));
  const panel = truthBarriers.querySelector("[data-truth-panel]");
  const panelInner = truthBarriers.querySelector("[data-truth-panel-inner]");
  const panelSymbol = truthBarriers.querySelector("[data-truth-panel-symbol]");
  const panelTitle = truthBarriers.querySelector("[data-truth-panel-title]");
  const panelCopy = truthBarriers.querySelector("[data-truth-panel-copy]");
  let activeIndex = 0;

  const renderTruthBarrier = (index) => {
    const item = truthBarrierData[index];
    if (!item || !panel) return;

    activeIndex = index;
    panelSymbol.textContent = item.symbol;
    panelTitle.textContent = item.title;
    panelCopy.innerHTML = item.copy.map((paragraph) => `<p>${paragraph}</p>`).join("");
    panel.setAttribute("aria-labelledby", `truth-tab-${index}`);
    panelInner.classList.remove("is-updating");
    void panelInner.offsetWidth;
    panelInner.classList.add("is-updating");

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
  };

  tabs.forEach((tab) => {
    const index = Number(tab.dataset.truthTab);

    tab.addEventListener("click", () => {
      renderTruthBarrier(index);
    });

    tab.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        renderTruthBarrier(index);
      }
    });

    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        tabs[nextIndex].focus();
        renderTruthBarrier(nextIndex);
      }
    });
  });

  renderTruthBarrier(0);
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

/**
 * Google Sheets lead capture — paste your Apps Script Web App URL here after setup.
 * Leave empty to only save leads in the browser (not recommended for production).
 * Setup guide: see GOOGLE_SHEETS_SETUP.txt in this folder.
 */
const LEADS_SHEET_WEBHOOK_URL = "";

function saveLeadLocally(leadPayload) {
  const existingLeads = JSON.parse(localStorage.getItem("apex_union_leads") || "[]");
  existingLeads.push(leadPayload);
  localStorage.setItem("apex_union_leads", JSON.stringify(existingLeads));
}

async function submitLead(leadPayload) {
  saveLeadLocally(leadPayload);

  if (!LEADS_SHEET_WEBHOOK_URL) {
    return { ok: true, sheet: false };
  }

  const response = await fetch(LEADS_SHEET_WEBHOOK_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadPayload),
  });

  if (!response.ok) {
    throw new Error("Could not save your application. Please try again.");
  }

  const result = await response.json();
  if (!result.ok) {
    throw new Error(result.error || "Could not save your application.");
  }

  return { ok: true, sheet: true };
}

const floatingApplyCta = document.querySelector(".floating-apply-cta");
const floatingApplyTrigger =
  document.querySelector(".hero") || document.querySelector("#enroll");
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

    const name = leadForm.name.value.trim();
    const email = leadForm.email.value.trim();
    const phone = leadForm.phone.value.trim();
    const track = leadForm.track.value;
    const status = leadForm.status.value;
    const source = leadForm.source.value || "unknown";

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = !phone || /^[0-9]{10}$/.test(phone);

    if (!name || !isEmailValid || !isPhoneValid || !track || !status) {
      leadFormMessage.textContent =
        "Please enter valid details (name, email, optional 10-digit phone, track, and current status).";
      leadFormMessage.classList.add("is-error");
      return;
    }

    const leadPayload = {
      name,
      email,
      phone,
      track,
      status,
      source,
      submittedAt: new Date().toISOString(),
    };

    const submitButton = leadForm.querySelector(".lead-submit");
    if (submitButton) submitButton.disabled = true;
    leadFormMessage.textContent = "Submitting…";
    leadFormMessage.classList.remove("is-error");

    try {
      await submitLead(leadPayload);
      leadFormMessage.textContent = "Thanks! Your application has been received.";
      leadForm.reset();
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

function updateFloatingApplyVisibility() {
  if (!floatingApplyCta || !floatingApplyTrigger) return;

  const triggerPoint = floatingApplyTrigger.offsetTop + floatingApplyTrigger.offsetHeight * 0.65;
  const shouldShow = window.scrollY > triggerPoint;

  floatingApplyCta.classList.toggle("is-visible", shouldShow);
}

updateFloatingApplyVisibility();
window.addEventListener("scroll", updateFloatingApplyVisibility, {
  passive: true,
});
window.addEventListener("resize", updateFloatingApplyVisibility);

const countupItems = document.querySelectorAll("[data-countup]");

function animateCountup(element) {
  const target = Number(element.dataset.target || "0");
  const suffix = element.dataset.suffix || "";
  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    const card = element.closest(".number-card");
    if (card) {
      card.classList.add("is-done");
      setTimeout(() => {
        card.classList.remove("is-done");
      }, 900);
    }
  }

  requestAnimationFrame(step);
}

if (countupItems.length > 0) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numbersSection = document.querySelector("#numbers");
  let hasPlayedForCurrentView = false;

  function setCountupToInitialValues() {
    countupItems.forEach((item) => {
      const suffix = item.dataset.suffix || "";
      item.textContent = `0${suffix}`;
      const card = item.closest(".number-card");
      if (card) card.classList.remove("is-done");
    });
  }

  function playCountup() {
    countupItems.forEach((item) => {
      if (reduceMotion) {
        const target = Number(item.dataset.target || "0");
        const suffix = item.dataset.suffix || "";
        item.textContent = `${target}${suffix}`;
      } else {
        animateCountup(item);
      }
    });
  }

  if (numbersSection) {
    setCountupToInitialValues();

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayedForCurrentView) {
            hasPlayedForCurrentView = true;
            playCountup();
          } else if (!entry.isIntersecting) {
            hasPlayedForCurrentView = false;
            setCountupToInitialValues();
          }
        });
      },
      { threshold: 0.45 }
    );

    sectionObserver.observe(numbersSection);
  }
}

const curriculumAccordion = document.querySelector("[data-curriculum-accordion]");

if (curriculumAccordion) {
  const curriculumToggles = curriculumAccordion.querySelectorAll(".curriculum-toggle");

  curriculumToggles.forEach((toggle) => {
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

const seatsRemainingElement = document.querySelector("[data-live-seats]");

if (seatsRemainingElement) {
  const startValue = Number(seatsRemainingElement.dataset.start || "27");
  const minValue = Number(seatsRemainingElement.dataset.min || "6");
  let currentSeats = startValue;

  seatsRemainingElement.textContent = String(currentSeats);

  window.setInterval(() => {
    if (currentSeats <= minValue) return;

    // Randomized tiny drops simulate live demand without jarring jumps.
    const decrement = Math.random() < 0.72 ? 1 : 2;
    currentSeats = Math.max(minValue, currentSeats - decrement);
    seatsRemainingElement.textContent = String(currentSeats);
  }, 16000);
}

const inlineLeadForm = document.querySelector("#inline-lead-form");
const inlineLeadMessage = document.querySelector("#inline-lead-message");

if (inlineLeadForm && inlineLeadMessage) {
  inlineLeadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = inlineLeadForm.name.value.trim();
    const email = inlineLeadForm.email.value.trim();
    const phone = inlineLeadForm.phone.value.trim();
    const track = inlineLeadForm.track.value;
    const status = inlineLeadForm.status.value || "Not specified";

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = /^[0-9]{10}$/.test(phone);

    if (!name || !isEmailValid || !isPhoneValid || !track) {
      inlineLeadMessage.textContent =
        "Please enter a valid name, email, 10-digit WhatsApp number, and track.";
      inlineLeadMessage.classList.add("is-error");
      return;
    }

    const leadPayload = {
      name,
      email,
      phone,
      track,
      status,
      source: "inline-enroll-section",
      submittedAt: new Date().toISOString(),
    };

    const submitButton = inlineLeadForm.querySelector(".enroll-submit");
    if (submitButton) submitButton.disabled = true;
    inlineLeadMessage.textContent = "Submitting…";
    inlineLeadMessage.classList.remove("is-error");

    try {
      await submitLead(leadPayload);
      inlineLeadMessage.textContent =
        "Great! You're in. Our team will share cohort details shortly.";
      inlineLeadForm.reset();
    } catch (error) {
      inlineLeadMessage.textContent =
        error.message || "Something went wrong. Please try again.";
      inlineLeadMessage.classList.add("is-error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const testimonialsCarousel = document.querySelector("[data-testimonials-carousel]");
const testimonialsTrack = document.querySelector("[data-testimonials-track]");
const testimonialsDots = document.querySelector("[data-testimonials-dots]");

if (testimonialsCarousel && testimonialsTrack && testimonialsDots) {
  const testimonialCards = Array.from(testimonialsTrack.children);

  function getCardsPerView() {
    if (window.matchMedia("(max-width: 767px)").matches) return 1;
    if (window.matchMedia("(max-width: 1024px)").matches) return 2;
    return 3;
  }

  let cardsPerView = getCardsPerView();
  let totalPages = Math.max(1, Math.ceil(testimonialCards.length / cardsPerView));
  let currentPage = 0;
  let autoPlayId = null;
  let lastWheelSwitchAt = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildDots() {
    testimonialsDots.innerHTML = "";
    for (let i = 0; i < totalPages; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testimonial-dot";
      dot.setAttribute("aria-label", `Go to testimonial slide ${i + 1}`);
      if (i === currentPage) dot.classList.add("is-active");
      dot.addEventListener("click", () => {
        currentPage = i;
        updateCarousel(true);
      });
      testimonialsDots.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = testimonialsDots.querySelectorAll(".testimonial-dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentPage);
    });
  }

  function updateCarousel(useSmoothScroll = false) {
    const targetIndex = currentPage * cardsPerView;
    const targetCard = testimonialCards[targetIndex];
    if (!targetCard) return;

    if (!useSmoothScroll) {
      const originalTransition = testimonialsTrack.style.transition;
      testimonialsTrack.style.transition = "none";
      testimonialsTrack.style.transform = `translateX(-${targetCard.offsetLeft}px)`;
      requestAnimationFrame(() => {
        testimonialsTrack.style.transition = originalTransition || "";
      });
    } else {
      testimonialsTrack.style.transform = `translateX(-${targetCard.offsetLeft}px)`;
    }

    updateDots();
  }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    autoPlayId = window.setInterval(() => {
      currentPage = (currentPage + 1) % totalPages;
      updateCarousel(true);
    }, 3200);
  }

  function stopAutoplay() {
    if (autoPlayId) {
      window.clearInterval(autoPlayId);
      autoPlayId = null;
    }
  }

  function refreshCarouselLayout() {
    cardsPerView = getCardsPerView();
    totalPages = Math.max(1, Math.ceil(testimonialCards.length / cardsPerView));
    currentPage = Math.min(currentPage, totalPages - 1);
    buildDots();
    updateCarousel(false);
  }

  testimonialsCarousel.addEventListener("mouseenter", stopAutoplay);
  testimonialsCarousel.addEventListener("mouseleave", startAutoplay);
  testimonialsCarousel.addEventListener(
    "wheel",
    (event) => {
      if (totalPages <= 1) return;
      const now = performance.now();
      if (now - lastWheelSwitchAt < 260) return;

      const deltaX = event.deltaX;
      const deltaY = event.deltaY;
      let direction = 0;

      if (Math.abs(deltaY) >= Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        direction = deltaY > 0 ? 1 : -1;
      } else if (Math.abs(deltaX) > 8) {
        direction = deltaX > 0 ? 1 : -1;
      }

      if (direction === 0) return;
      event.preventDefault();
      stopAutoplay();

      if (direction > 0) {
        currentPage = Math.min(currentPage + 1, totalPages - 1);
      } else {
        currentPage = Math.max(currentPage - 1, 0);
      }
      updateCarousel(true);
      lastWheelSwitchAt = now;
    },
    { passive: false }
  );

  refreshCarouselLayout();
  startAutoplay();
  window.addEventListener("resize", refreshCarouselLayout);
}

const animatedSections = document.querySelectorAll(
  ".hero, .partners, .truth-section, .about-apex-section, .programme-structure-section, .founders-section, .mentors-section, .graduates-section, .numbers-section, .comparison-section, .audience-section, .admission-section, .enroll-section, .faq-section, .testimonials-section"
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

const mentorMarquee = document.querySelector("[data-mentor-marquee]");

if (mentorMarquee) {
  const view = mentorMarquee.querySelector(".mentor-marquee-view");
  const track = mentorMarquee.querySelector(".mentor-marquee-track");
  const group = mentorMarquee.querySelector(".mentor-marquee-group");

  if (view && track && group) {
    if (!mentorMarquee.querySelector(".mentor-marquee-group--duplicate")) {
      const duplicateGroup = group.cloneNode(true);
      duplicateGroup.classList.add("mentor-marquee-group--duplicate");
      duplicateGroup.setAttribute("aria-hidden", "true");
      duplicateGroup.querySelectorAll("a").forEach((link) => {
        link.setAttribute("tabindex", "-1");
      });
      track.appendChild(duplicateGroup);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      let loopWidth = 0;
      let autoScrollActive = true;
      let resumeTimer = null;
      let rafId = null;
      let lastTimestamp = 0;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartScrollLeft = 0;
      const pixelsPerSecond = 32;

      function measureLoop() {
        loopWidth = group.getBoundingClientRect().width;
      }

      function pauseAutoScroll(duration = 4000) {
        autoScrollActive = false;
        window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(() => {
          autoScrollActive = true;
          lastTimestamp = 0;
        }, duration);
      }

      function normalizeScroll() {
        if (loopWidth <= 0) return;
        while (view.scrollLeft >= loopWidth) {
          view.scrollLeft -= loopWidth;
        }
      }

      function tick(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        if (autoScrollActive && loopWidth > 0 && !isDragging) {
          view.scrollLeft += (pixelsPerSecond * delta) / 1000;
          normalizeScroll();
        }

        rafId = window.requestAnimationFrame(tick);
      }

      measureLoop();
      window.addEventListener("resize", measureLoop);

      view.setAttribute("tabindex", "0");
      view.setAttribute("role", "region");
      view.setAttribute("aria-label", "Scroll mentor profiles horizontally");

      view.addEventListener(
        "scroll",
        () => {
          normalizeScroll();
        },
        { passive: true }
      );

      view.addEventListener("wheel", () => pauseAutoScroll(), { passive: true });
      view.addEventListener("touchstart", () => pauseAutoScroll(), { passive: true });
      view.addEventListener("keydown", (event) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          pauseAutoScroll();
        }
      });

      view.addEventListener("mouseenter", () => {
        autoScrollActive = false;
      });

      view.addEventListener("mouseleave", () => {
        if (!isDragging) {
          autoScrollActive = true;
          lastTimestamp = 0;
        }
      });

      view.addEventListener("pointerdown", (event) => {
        if (event.target.closest("a, button")) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        isDragging = true;
        view.classList.add("is-dragging");
        dragStartX = event.clientX;
        dragStartScrollLeft = view.scrollLeft;
        pauseAutoScroll(6000);
        view.setPointerCapture(event.pointerId);
      });

      view.addEventListener("pointermove", (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - dragStartX;
        view.scrollLeft = dragStartScrollLeft - deltaX;
        normalizeScroll();
      });

      function endDrag(event) {
        if (!isDragging) return;
        isDragging = false;
        view.classList.remove("is-dragging");
        if (event?.pointerId !== undefined && view.hasPointerCapture(event.pointerId)) {
          view.releasePointerCapture(event.pointerId);
        }
      }

      view.addEventListener("pointerup", endDrag);
      view.addEventListener("pointercancel", endDrag);

      rafId = window.requestAnimationFrame(tick);

      window.addEventListener("beforeunload", () => {
        if (rafId) window.cancelAnimationFrame(rafId);
        window.clearTimeout(resumeTimer);
      });
    }
  }
}
