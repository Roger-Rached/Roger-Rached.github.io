/* =========================================================
   HOMEPAGE INTERACTIONS
   Decorative effects only; no live security telemetry.
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = () => Boolean(reducedMotion.matches);

    // Local system-date label: uses the visitor's own local calendar date.
    const localDate = document.getElementById("local-date");
    if (localDate) {
        const updateLocalDate = () => {
            const now = new Date();
            const parts = new Intl.DateTimeFormat(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }).formatToParts(now);
            const dateParts = Object.fromEntries(parts
                .filter(part => part.type !== "literal")
                .map(part => [part.type, part.value]));
            const formatted = [
                dateParts.day,
                dateParts.month.replace(".", ""),
                dateParts.year
            ].join(" ").toUpperCase();
            localDate.textContent = "SYSTEM DATE: " + formatted;

            const nextMidnight = new Date(now);
            nextMidnight.setDate(nextMidnight.getDate() + 1);
            nextMidnight.setHours(0, 0, 5, 0);
            window.setTimeout(updateLocalDate, Math.max(1000, nextMidnight.getTime() - now.getTime()));
        };
        updateLocalDate();
    }

    // Responsive navigation is a disclosure rather than a modal.
    const navbar = document.querySelector(".navbar");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const mobileNavigation = window.matchMedia("(max-width: 950px)");

    if (navbar && navToggle && navLinks) {
        navbar.classList.add("has-mobile-nav");
        const setNavigationOpen = isOpen => {
            navbar.classList.toggle("nav-open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        };

        navToggle.addEventListener("click", () => {
            const open = navToggle.getAttribute("aria-expanded") !== "true";
            setNavigationOpen(open);
            if (open && mobileNavigation.matches) navLinks.querySelector("a")?.focus();
        });
        navLinks.addEventListener("click", event => {
            if (event.target instanceof Element && event.target.closest("a")) setNavigationOpen(false);
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
                setNavigationOpen(false);
                navToggle.focus();
            }
        });
        document.addEventListener("click", event => {
            if (navToggle.getAttribute("aria-expanded") === "true" &&
                !navbar.contains(event.target) && mobileNavigation.matches) {
                setNavigationOpen(false);
            }
        });
    }

    // Scroll reveals remain a progressive enhancement and are skipped when motion is reduced.
    const revealElements = document.querySelectorAll(
        ".focus-card, .writeup-item, .project-card, .research-box"
    );
    if (!prefersReducedMotion() && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        revealElements.forEach(element => {
            element.classList.add("reveal");
            observer.observe(element);
        });
    }

    // Light-weight, purple/blue character rain contained in the hero only.
    const hero = document.querySelector(".hero");
    const canvas = document.getElementById("hero-matrix");
    if (hero && canvas && typeof canvas.getContext === "function") {
        let context = null;
        try {
            context = canvas.getContext("2d");
        } catch (error) {
            console.warn("Hero matrix unavailable; leaving the rest of the page active.", error);
        }
        if (context) {
            const symbols = "0123456789abcdef<>_/$[]{}";
            const fontSize = 13;
            const columnWidth = 17;
            let width = 0;
            let height = 0;
            let ratio = 1;
            let drops = [];
            let frameId = null;
            let timerId = null;

            const resizeCanvas = () => {
                const rect = hero.getBoundingClientRect();
                width = Math.max(1, rect.width);
                height = Math.max(1, rect.height);
                ratio = Math.min(window.devicePixelRatio || 1, 1.5);
                canvas.width = Math.round(width * ratio);
                canvas.height = Math.round(height * ratio);
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
                context.setTransform(ratio, 0, 0, ratio, 0, 0);
                const columns = Math.ceil(width / columnWidth);
                drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));
                drawRain(false);
            };

            const drawRain = advance => {
                if (!context || !width || !height) return;
                context.clearRect(0, 0, width, height);
                const compact = window.matchMedia("(max-width: 700px)").matches;
                const stride = compact ? 2 : 1;
                context.font = fontSize + 'px "JetBrains Mono", monospace';
                for (let column = 0; column < drops.length; column += stride) {
                    const y = drops[column] * fontSize;
                    for (let trail = 0; trail < 4; trail++) {
                        const charY = y - trail * fontSize;
                        if (charY < 0 || charY > height) continue;
                        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                        const alpha = (0.12 - trail * 0.025) * (compact ? 0.72 : 1);
                        context.fillStyle = column % 3 === 0
                            ? "rgba(155, 92, 255, " + alpha + ")"
                            : "rgba(112, 132, 255, " + alpha + ")";
                        context.fillText(symbol, column * columnWidth, charY);
                    }
                    if (advance) {
                        drops[column] += 0.13 + Math.random() * 0.13;
                        if (drops[column] * fontSize > height + fontSize * 5 && Math.random() > 0.975) {
                            drops[column] = -Math.random() * 8;
                        }
                    }
                }
            };

            const stopRain = () => {
                if (frameId !== null) window.cancelAnimationFrame(frameId);
                if (timerId !== null) window.clearTimeout(timerId);
                frameId = null;
                timerId = null;
            };
            const animateRain = () => {
                frameId = null;
                if (prefersReducedMotion() || document.visibilityState === "hidden") return;
                drawRain(true);
                // Draw at roughly 16 frames/second instead of waking the canvas on every display refresh.
                timerId = window.setTimeout(() => {
                    timerId = null;
                    if (!prefersReducedMotion() && document.visibilityState !== "hidden") {
                        frameId = window.requestAnimationFrame(animateRain);
                    }
                }, 60);
            };
            const refreshRain = () => {
                stopRain();
                if (prefersReducedMotion()) {
                    drawRain(false);
                } else if (document.visibilityState !== "hidden") {
                    frameId = window.requestAnimationFrame(animateRain);
                }
            };

            resizeCanvas();
            refreshRain();
            if ("ResizeObserver" in window) {
                const resizeObserver = new ResizeObserver(resizeCanvas);
                resizeObserver.observe(hero);
            } else {
                window.addEventListener("resize", resizeCanvas, { passive: true });
            }
            document.addEventListener("visibilitychange", refreshRain);
            if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", refreshRain);
            else if (reducedMotion.addListener) reducedMotion.addListener(refreshRain);
        }
    }

    // A soft pointer-following glow stays behind the hero content; no tilt or layout changes.
    const finePointer = window.matchMedia("(pointer: fine)");
    if (hero && finePointer.matches && !prefersReducedMotion()) {
        let pendingFrame = null;
        let latestPoint = null;
        const applyPointerGlow = () => {
            pendingFrame = null;
            if (!latestPoint) return;
            const rect = hero.getBoundingClientRect();
            hero.style.setProperty("--pointer-x", Math.round(latestPoint.x - rect.left) + "px");
            hero.style.setProperty("--pointer-y", Math.round(latestPoint.y - rect.top) + "px");
        };
        hero.addEventListener("pointermove", event => {
            if (event.pointerType === "touch") return;
            latestPoint = { x: event.clientX, y: event.clientY };
            if (pendingFrame === null) pendingFrame = window.requestAnimationFrame(applyPointerGlow);
        }, { passive: true });
        hero.addEventListener("pointerleave", () => {
            latestPoint = null;
            hero.style.removeProperty("--pointer-x");
            hero.style.removeProperty("--pointer-y");
            if (pendingFrame !== null) window.cancelAnimationFrame(pendingFrame);
            pendingFrame = null;
        }, { passive: true });
    }

    // Reduce repeated brand animation to a user-driven hover/focus effect, not a persistent glitch.
    if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener("change", () => {
            if (prefersReducedMotion() && hero) {
                hero.style.removeProperty("--pointer-x");
                hero.style.removeProperty("--pointer-y");
            }
        });
    }
});
