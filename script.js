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

    // Lightweight Matrix rain: stable glyphs, bounded frame rate and one scheduled frame at a time.
    const hero = document.querySelector(".hero");
    const canvas = document.getElementById("hero-matrix");
    if (hero && canvas && typeof canvas.getContext === "function" &&
        canvas.dataset.matrixInitialized !== "true") {
        let context = null;
        try {
            context = canvas.getContext("2d");
        } catch (error) {
            console.warn("Hero Matrix canvas is unavailable; the rest of the homepage remains active.", error);
        }

        if (context) {
            canvas.dataset.matrixInitialized = "true";
            const symbols = "0123456789abcdef<>_/$[]{}";
            const fontSize = 13;
            const columnWidth = 17;
            const compactQuery = window.matchMedia("(max-width: 700px)");
            let width = 0;
            let height = 0;
            let ratio = 1;
            let drops = [];
            let glyphs = [];
            let frameId = null;
            let timerId = null;
            let lastFrameAt = 0;

            const randomGlyph = () => symbols[Math.floor(Math.random() * symbols.length)];

            const stopRain = () => {
                if (frameId !== null) window.cancelAnimationFrame(frameId);
                if (timerId !== null) window.clearTimeout(timerId);
                frameId = null;
                timerId = null;
                lastFrameAt = 0;
            };

            const drawRain = advance => {
                if (!context || !width || !height) return;
                context.clearRect(0, 0, width, height);
                const compact = compactQuery.matches;
                const stride = compact ? 2 : 1;
                context.font = fontSize + 'px "JetBrains Mono", monospace';

                for (let column = 0; column < drops.length; column += stride) {
                    const y = drops[column] * fontSize;
                    for (let trail = 0; trail < 4; trail++) {
                        const charY = y - trail * fontSize;
                        if (charY < 0 || charY > height) continue;
                        if (advance && Math.random() < 0.018) {
                            glyphs[column][trail] = randomGlyph();
                        }
                        const alpha = (0.12 - trail * 0.025) * (compact ? 0.65 : 1);
                        context.fillStyle = column % 3 === 0
                            ? "rgba(155, 92, 255, " + alpha + ")"
                            : "rgba(112, 132, 255, " + alpha + ")";
                        context.fillText(glyphs[column][trail], column * columnWidth, charY);
                    }
                    if (advance) {
                        drops[column] += compact ? 0.22 : 0.30;
                        if (drops[column] * fontSize > height + fontSize * 5 && Math.random() > 0.97) {
                            drops[column] = -Math.random() * 8;
                        }
                    }
                }
            };

            const resizeCanvas = force => {
                const rect = hero.getBoundingClientRect();
                const nextWidth = Math.max(1, Math.round(rect.width));
                const nextHeight = Math.max(1, Math.round(rect.height));
                if (!force && nextWidth === width && nextHeight === height && drops.length) return;

                width = nextWidth;
                height = nextHeight;
                ratio = Math.min(window.devicePixelRatio || 1, compactQuery.matches ? 1 : 1.35);
                canvas.width = Math.round(width * ratio);
                canvas.height = Math.round(height * ratio);
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
                context.setTransform(ratio, 0, 0, ratio, 0, 0);

                const columns = Math.ceil(width / columnWidth);
                drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));
                glyphs = Array.from({ length: columns }, () =>
                    Array.from({ length: 4 }, randomGlyph)
                );
                drawRain(false);
            };

            const scheduleNextFrame = () => {
                if (frameId !== null || timerId !== null ||
                    prefersReducedMotion() || document.visibilityState === "hidden") return;

                timerId = window.setTimeout(() => {
                    timerId = null;
                    if (!prefersReducedMotion() && document.visibilityState !== "hidden") {
                        frameId = window.requestAnimationFrame(animateRain);
                    }
                }, compactQuery.matches ? 58 : 34);
            };

            const animateRain = timestamp => {
                frameId = null;
                if (prefersReducedMotion() || document.visibilityState === "hidden") return;
                const frameInterval = compactQuery.matches ? 1000 / 13 : 1000 / 20;
                if (!lastFrameAt || timestamp - lastFrameAt >= frameInterval) {
                    drawRain(true);
                    lastFrameAt = timestamp;
                }
                scheduleNextFrame();
            };

            const refreshRain = () => {
                stopRain();
                if (prefersReducedMotion()) {
                    drawRain(false);
                } else if (document.visibilityState !== "hidden") {
                    scheduleNextFrame();
                }
            };

            resizeCanvas(true);
            refreshRain();

            if ("ResizeObserver" in window) {
                const resizeObserver = new ResizeObserver(() => resizeCanvas(false));
                resizeObserver.observe(hero);
            } else {
                window.addEventListener("resize", () => resizeCanvas(false), { passive: true });
            }

            document.addEventListener("visibilitychange", refreshRain);
            window.addEventListener("pagehide", stopRain);
            window.addEventListener("pageshow", refreshRain);
            if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", refreshRain);
            else if (reducedMotion.addListener) reducedMotion.addListener(refreshRain);
            const refreshCompactMode = () => {
                resizeCanvas(true);
                refreshRain();
            };
            if (compactQuery.addEventListener) compactQuery.addEventListener("change", refreshCompactMode);
            else if (compactQuery.addListener) compactQuery.addListener(refreshCompactMode);
        }
    }

    // Site-wide cursor glow, behind page content and disabled for touch/reduced motion.
    const finePointer = window.matchMedia("(pointer: fine)");
    const pointerBody = document.body;
    if (pointerBody && finePointer.matches && !prefersReducedMotion()) {
        let pendingGlowFrame = null;
        let latestPointer = null;

        const hideCursorGlow = () => {
            latestPointer = null;
            if (pendingGlowFrame !== null) window.cancelAnimationFrame(pendingGlowFrame);
            pendingGlowFrame = null;
            pointerBody.classList.remove("has-global-cursor-glow");
            pointerBody.style.setProperty("--site-cursor-x", "-1000px");
            pointerBody.style.setProperty("--site-cursor-y", "-1000px");
        };

        const paintCursorGlow = () => {
            pendingGlowFrame = null;
            if (!latestPointer || prefersReducedMotion()) return;
            pointerBody.style.setProperty("--site-cursor-x", latestPointer.x + "px");
            pointerBody.style.setProperty("--site-cursor-y", latestPointer.y + "px");
            pointerBody.classList.add("has-global-cursor-glow");
        };

        document.addEventListener("pointermove", event => {
            if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
            latestPointer = { x: event.clientX, y: event.clientY };
            if (pendingGlowFrame === null) {
                pendingGlowFrame = window.requestAnimationFrame(paintCursorGlow);
            }
        }, { passive: true });

        document.addEventListener("pointerout", event => {
            if (!event.relatedTarget) hideCursorGlow();
        }, { passive: true });

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") hideCursorGlow();
        });
        window.addEventListener("blur", hideCursorGlow);
        if (reducedMotion.addEventListener) {
            reducedMotion.addEventListener("change", () => {
                if (prefersReducedMotion()) hideCursorGlow();
            });
        } else if (reducedMotion.addListener) {
            reducedMotion.addListener(() => {
                if (prefersReducedMotion()) hideCursorGlow();
            });
        }
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
