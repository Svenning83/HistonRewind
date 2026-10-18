"use strict";

// Add a confirmed business email here to enable direct mail enquiries.
const CONTACT_EMAIL = "";

const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  siteNav.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 920) closeMenu();
});

const progressBar = document.querySelector(".scroll-progress");
const heroArt = document.querySelector(".hero-art");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollFramePending = false;

function updateScrollEffects() {
  const scrollableHeight = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const progress = scrollableHeight ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
  progressBar.style.setProperty("--scroll-progress", progress);
  progressBar.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  if (!reducedMotion.matches) {
    heroArt.style.setProperty("--hero-shift", `${Math.min(26, Math.max(0, window.scrollY * .055))}px`);
  }
  scrollFramePending = false;
}

function scheduleScrollEffects() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(updateScrollEffects);
}

window.addEventListener("scroll", scheduleScrollEffects, { passive: true });
window.addEventListener("resize", scheduleScrollEffects);
window.addEventListener("load", scheduleScrollEffects);
updateScrollEffects();

const comparisonRange = document.querySelector(".comparison-range");
comparisonRange.addEventListener("input", () => {
  comparisonRange.parentElement.style.setProperty("--split", `${comparisonRange.value}%`);
});

const quantityInputs = {
  tapes: document.getElementById("tapes"),
  negatives: document.getElementById("negatives"),
  slides: document.getElementById("slides"),
};
const estimateAmount = document.getElementById("estimate-amount");
const estimateBreakdown = document.getElementById("estimate-breakdown");
const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

function safeQuantity(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(9999, Math.max(0, Math.trunc(number))) : 0;
}

function getQuantities() {
  return {
    tapes: safeQuantity(quantityInputs.tapes.value),
    negatives: safeQuantity(quantityInputs.negatives.value),
    slides: safeQuantity(quantityInputs.slides.value),
  };
}

function updateEstimate() {
  const counts = getQuantities();
  const totalInPence = counts.tapes * 1000 + (counts.negatives + counts.slides) * 40;
  const items = [
    counts.tapes && `${counts.tapes} tape${counts.tapes === 1 ? "" : "s"}`,
    counts.negatives && `${counts.negatives} negative${counts.negatives === 1 ? "" : "s"}`,
    counts.slides && `${counts.slides} slide${counts.slides === 1 ? "" : "s"}`,
  ].filter(Boolean);

  estimateAmount.textContent = money.format(totalInPence / 100);
  estimateBreakdown.textContent = items.length ? items.join(" + ") : "Add your items above";
  return counts;
}

Object.values(quantityInputs).forEach((input) => {
  input.addEventListener("input", updateEstimate);
  input.addEventListener("change", () => {
    input.value = safeQuantity(input.value);
    updateEstimate();
  });
});

document.querySelectorAll("[data-target][data-change]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = quantityInputs[button.dataset.target];
    input.value = safeQuantity(safeQuantity(input.value) + Number(button.dataset.change));
    updateEstimate();
  });
});

const messageField = document.getElementById("customer-message");
messageField.addEventListener("input", () => {
  delete messageField.dataset.estimateDraft;
});

document.getElementById("use-estimate").addEventListener("click", () => {
  const counts = updateEstimate();
  if (messageField.value.trim() && messageField.dataset.estimateDraft !== "true") return;

  const items = [
    counts.tapes && `${counts.tapes} tape${counts.tapes === 1 ? "" : "s"}`,
    counts.negatives && `${counts.negatives} negative${counts.negatives === 1 ? "" : "s"}`,
    counts.slides && `${counts.slides} slide${counts.slides === 1 ? "" : "s"}`,
  ].filter(Boolean);
  messageField.value = items.length
    ? `Hello Histon Rewind,\n\nI would like to ask about digitising ${items.join(", ")}. The website estimated ${estimateAmount.textContent}. Could you let me know the next steps?`
    : "Hello Histon Rewind,\n\nI would like to ask about digitising some family memories. Could you let me know the next steps?";
  messageField.dataset.estimateDraft = "true";
});

const enquiryForm = document.getElementById("enquiry-form");
const enquiryResult = document.getElementById("enquiry-result");
const enquiryCopy = document.getElementById("enquiry-copy");
const enquiryStatus = document.getElementById("enquiry-status");

if (CONTACT_EMAIL) {
  document.getElementById("contact-availability").textContent =
    "Preparing an enquiry will open your email app so you can send it to us. You can also copy the message below.";
  const emailLink = document.getElementById("direct-email");
  emailLink.href = `mailto:${CONTACT_EMAIL}`;
  emailLink.textContent = CONTACT_EMAIL;
  emailLink.hidden = false;
}

enquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("customer-name").value.trim();
  const email = document.getElementById("customer-email").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const message = messageField.value.trim();
  enquiryCopy.value = [
    `Hello Histon Rewind,`,
    "",
    message,
    "",
    `From: ${name}`,
    `Email: ${email}`,
    ...(phone ? [`Phone: ${phone}`] : []),
  ].join("\n");
  enquiryResult.hidden = false;
  enquiryStatus.textContent = CONTACT_EMAIL
    ? "Your email app should open. If it does not, you can copy the message instead."
    : "Your message is ready to copy. Direct contact details will be added soon.";

  if (CONTACT_EMAIL) {
    const subject = encodeURIComponent(`Histon Rewind enquiry from ${name}`);
    const body = encodeURIComponent(enquiryCopy.value);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  } else {
    enquiryResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});
enquiryForm.querySelector(".form-submit").disabled = false;

document.getElementById("copy-enquiry").addEventListener("click", async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(enquiryCopy.value);
    } else {
      enquiryCopy.select();
      if (!document.execCommand("copy")) throw new Error("Copy unavailable");
    }
    enquiryStatus.textContent = "Copied. You can paste your message wherever you need it.";
  } catch {
    enquiryCopy.focus();
    enquiryCopy.select();
    enquiryStatus.textContent = "Select the message above and copy it with Ctrl+C (or Command+C).";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  document.documentElement.classList.add("motion-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: "0px 0px -25px 0px" });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  const tapeObserver = new IntersectionObserver(([entry]) => {
    entry.target.classList.toggle("is-playing", entry.isIntersecting);
  }, { threshold: .1 });
  tapeObserver.observe(document.querySelector(".cassette"));
}
