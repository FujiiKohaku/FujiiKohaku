"use strict";
const kGalleryIntervalMs = 5000;
let workGallery = document.getElementById("workGallery");
let galleryTrack = document.getElementById("galleryTrack");
let gallerySlides = Array.from(galleryTrack.children);
let galleryCounter = document.getElementById("galleryCounter");
let galleryPlayback = document.getElementById("galleryPlayback");
let galleryAnnouncement = document.getElementById("galleryAnnouncement");
let galleryMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let galleryPosition = 1;
let galleryTimerId;
let isGalleryPaused = false;
let isGalleryHovered = false;
let isGalleryVisible = true;
let isGalleryMoving = false;

function UpdateGallerySlides() {
    let slideIndex = (galleryPosition - 1 + gallerySlides.length) % gallerySlides.length;
    galleryCounter.textContent = String(slideIndex + 1).padStart(2, "0") + " / " +
        String(gallerySlides.length).padStart(2, "0");
    let positionIndex = 0;
    for (let slide of galleryTrack.children) {
        slide.classList.toggle("is-current", positionIndex === galleryPosition);
        let isOriginalCurrent = slide === gallerySlides[slideIndex];
        slide.setAttribute("aria-hidden", String(!isOriginalCurrent));
        positionIndex++;
    }
    galleryTrack.style.setProperty("--galleryIndex", String(galleryPosition));
}

function ScheduleGallery() {
    window.clearTimeout(galleryTimerId);
    galleryTimerId = undefined;
    galleryPlayback.disabled = galleryMotionPreference.matches;
    galleryPlayback.textContent = "一時停止";
    if (isGalleryPaused || galleryMotionPreference.matches) {
        galleryPlayback.textContent = "自動再生";
    }
    galleryPlayback.setAttribute("aria-pressed", String(isGalleryPaused));
    if (!isGalleryPaused && !isGalleryHovered && !workGallery.matches(":focus-within") &&
        !document.hidden && isGalleryVisible && !galleryMotionPreference.matches && !isGalleryMoving) {
        galleryTimerId = window.setTimeout(AdvanceGallery, kGalleryIntervalMs);
    }
}

function FinishGallerySlide(event) {
    if (event && (event.target !== galleryTrack || event.propertyName !== "transform")) {
        return;
    }
    if (!isGalleryMoving) {
        return;
    }
    if (galleryPosition === 0 || galleryPosition === gallerySlides.length + 1) {
        galleryTrack.classList.add("is-resetting");
        if (galleryPosition === 0) {
            galleryPosition = gallerySlides.length;
        } else {
            galleryPosition = 1;
        }
        UpdateGallerySlides();
        // Commit the clone-to-original reset before enabling the next transition.
        galleryTrack.getBoundingClientRect();
        galleryTrack.classList.remove("is-resetting");
    }
    isGalleryMoving = false;
    ScheduleGallery();
}

function MoveGallery(direction, shouldAnnounce) {
    if (isGalleryMoving) {
        return;
    }
    window.clearTimeout(galleryTimerId);
    galleryPosition += direction;
    isGalleryMoving = true;
    UpdateGallerySlides();
    if (shouldAnnounce) {
        galleryAnnouncement.textContent = "作品 " + galleryCounter.textContent;
    }
    if (galleryMotionPreference.matches) {
        FinishGallerySlide();
    }
}

function AdvanceGallery() { MoveGallery(1, false); }
function ShowNextGallerySlide() { MoveGallery(1, true); }
function ShowPreviousGallerySlide() { MoveGallery(-1, true); }
function ToggleGalleryPlayback() {
    isGalleryPaused = !isGalleryPaused;
    ScheduleGallery();
}
function PauseGalleryOnHover() {
    isGalleryHovered = true;
    ScheduleGallery();
}
function ResumeGalleryAfterHover() {
    isGalleryHovered = false;
    ScheduleGallery();
}
function HandleGalleryFocusOut() { window.setTimeout(ScheduleGallery, 0); }
function HandleGalleryMotion() {
    FinishGallerySlide();
    ScheduleGallery();
}
function HandleGalleryVisibility() {
    if (document.hidden) {
        FinishGallerySlide();
    }
    ScheduleGallery();
}
function ObserveGallery(entries) {
    for (let entry of entries) {
        isGalleryVisible = entry.isIntersecting;
    }
    ScheduleGallery();
}

let firstGalleryClone = gallerySlides[0].cloneNode(true);
let lastGalleryClone = gallerySlides[gallerySlides.length - 1].cloneNode(true);
firstGalleryClone.setAttribute("aria-hidden", "true");
lastGalleryClone.setAttribute("aria-hidden", "true");
galleryTrack.prepend(lastGalleryClone);
galleryTrack.append(firstGalleryClone);
galleryTrack.classList.add("is-resetting");
UpdateGallerySlides();
galleryTrack.getBoundingClientRect();
galleryTrack.classList.remove("is-resetting");
galleryTrack.addEventListener("transitionend", FinishGallerySlide);
galleryTrack.addEventListener("transitioncancel", FinishGallerySlide);
document.getElementById("galleryNext").addEventListener("click", ShowNextGallerySlide);
document.getElementById("galleryPrevious").addEventListener("click", ShowPreviousGallerySlide);
galleryPlayback.addEventListener("click", ToggleGalleryPlayback);
workGallery.addEventListener("mouseenter", PauseGalleryOnHover);
workGallery.addEventListener("mouseleave", ResumeGalleryAfterHover);
workGallery.addEventListener("focusin", ScheduleGallery);
workGallery.addEventListener("focusout", HandleGalleryFocusOut);
document.addEventListener("visibilitychange", HandleGalleryVisibility);
galleryMotionPreference.addEventListener("change", HandleGalleryMotion);
if ("IntersectionObserver" in window) {
    let galleryObserver = new IntersectionObserver(ObserveGallery, { threshold: .1 });
    galleryObserver.observe(workGallery);
}
ScheduleGallery();
