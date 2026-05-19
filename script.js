const truthCards = document.querySelectorAll(".truth-card");

truthCards.forEach((card) => {
  const toggle = card.querySelector(".truth-card-toggle");
  const front = card.querySelector(".truth-card-front");
  const back = card.querySelector(".truth-card-back");

  if (!toggle || !front || !back) return;

  toggle.addEventListener("click", () => {
    const isFlipped = card.classList.toggle("is-flipped");
    toggle.setAttribute("aria-expanded", String(isFlipped));
    front.setAttribute("aria-hidden", String(isFlipped));
    back.setAttribute("aria-hidden", String(!isFlipped));
  });
});

function initMentorCard(card) {
  const toggle = card.querySelector(".mentor-card-toggle");
  const front = card.querySelector(".mentor-card-front");
  const back = card.querySelector(".mentor-card-back");

  if (!toggle || !front || !back) return;

  toggle.addEventListener("click", () => {
    const isFlipped = card.classList.toggle("is-flipped");
    toggle.setAttribute("aria-expanded", String(isFlipped));
    front.setAttribute("aria-hidden", String(isFlipped));
    back.setAttribute("aria-hidden", String(!isFlipped));
  });
}

const mentorCardTrack = document.querySelector(".mentor-cards");

if (mentorCardTrack) {
  const originalCards = Array.from(mentorCardTrack.querySelectorAll(".mentor-card"));

  originalCards.forEach((card) => {
    initMentorCard(card);
  });

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.classList.add("is-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button").forEach((el) => {
      el.setAttribute("tabindex", "-1");
    });
    mentorCardTrack.appendChild(clone);
  });

  const updateMentorGalleryDistance = () => {
    const firstClone = mentorCardTrack.querySelector(".mentor-card.is-clone");
    if (!firstClone) return;
    mentorCardTrack.style.setProperty("--mentor-scroll-distance", `${firstClone.offsetLeft}px`);
  };

  updateMentorGalleryDistance();
  window.addEventListener("resize", updateMentorGalleryDistance);
}

const mentorGallery = document.querySelector(".mentor-gallery");

if (mentorGallery) {
  mentorGallery.addEventListener(
    "wheel",
    (event) => {
      const maxScrollLeft = mentorGallery.scrollWidth - mentorGallery.clientWidth;
      if (maxScrollLeft <= 0) return;

      const primaryDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (primaryDelta === 0) return;

      const nextScrollLeft = mentorGallery.scrollLeft + primaryDelta;
      const canScrollFurtherLeft = mentorGallery.scrollLeft > 0;
      const canScrollFurtherRight = mentorGallery.scrollLeft < maxScrollLeft - 1;
      const isScrollingLeft = primaryDelta < 0;
      const isScrollingRight = primaryDelta > 0;

      // Allow normal page up/down scroll when horizontal gallery is at boundaries.
      if ((isScrollingLeft && !canScrollFurtherLeft) || (isScrollingRight && !canScrollFurtherRight)) {
        return;
      }

      event.preventDefault();
      mentorGallery.scrollLeft = Math.max(0, Math.min(maxScrollLeft, nextScrollLeft));
    },
    { passive: false }
  );
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
const launchpadSection = document.querySelector(".launchpad-section");
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
  if (!floatingApplyCta || !launchpadSection) return;

  const triggerPoint = launchpadSection.offsetTop + launchpadSection.offsetHeight - 240;
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
  let cardsPerView = window.matchMedia("(max-width: 767px)").matches ? 1 : 3;
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
    cardsPerView = window.matchMedia("(max-width: 767px)").matches ? 1 : 3;
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
  ".hero, .partners, .truth-section, .founders-section, .launchpad-section, .mentors-section, .graduates-section, .numbers-section, .curriculum-section, .investment-section, .enroll-section, .faq-section, .testimonials-section"
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
