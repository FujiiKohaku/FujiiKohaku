"use strict";

const kEntryStorageKey = "fujiiPortfolioEntrySeenV1";
const kEntryFallbackDurationMs = 2200;
let entryIntro = document.getElementById("entryIntro");
let entryMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let entryColorPreference = window.matchMedia("(forced-colors: active)");
let entryTimerId;

function FinishEntryIntro() {
    window.clearTimeout(entryTimerId);
    entryIntro.hidden = true;
    entryIntro.removeEventListener("animationend", HandleEntryAnimationEnd);
    document.removeEventListener("keydown", FinishEntryIntro, true);
    document.removeEventListener("pointerdown", FinishEntryIntro, true);
    window.removeEventListener("pagehide", FinishEntryIntro);
    entryMotionPreference.removeEventListener("change", FinishEntryIntro);
    entryColorPreference.removeEventListener("change", FinishEntryIntro);
}

function HandleEntryAnimationEnd(event) {
    if (event.target === entryIntro) {
        FinishEntryIntro();
    }
}

function InitializeEntryIntro() {
    if (entryMotionPreference.matches || entryColorPreference.matches || window.location.hash) {
        return;
    }
    try {
        if (sessionStorage.getItem(kEntryStorageKey) === "seen") {
            return;
        }
        sessionStorage.setItem(kEntryStorageKey, "seen");
    } catch (error) {
        // The short introduction also works when browser storage is unavailable.
    }
    entryIntro.addEventListener("animationend", HandleEntryAnimationEnd);
    document.addEventListener("keydown", FinishEntryIntro, true);
    document.addEventListener("pointerdown", FinishEntryIntro, true);
    window.addEventListener("pagehide", FinishEntryIntro);
    entryMotionPreference.addEventListener("change", FinishEntryIntro);
    entryColorPreference.addEventListener("change", FinishEntryIntro);
    entryTimerId = window.setTimeout(FinishEntryIntro, kEntryFallbackDurationMs);
    entryIntro.hidden = false;
}

InitializeEntryIntro();
