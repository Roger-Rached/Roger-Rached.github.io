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
    // Homepage cyber effects run by default; CSS exposes the same state to the phase animation.
    const visualEffectsEnabled = true;
    const motionSuppressed = () => !visualEffectsEnabled || prefersReducedMotion();
    document.documentElement.dataset.visualEffects = "on";

    // Always show the live date and clock for Dubai (GST, UTC+04:00), independent of visitor locale.
    const dubaiDate = document.getElementById("local-date");
    if (dubaiDate) {
        const dateFormatter = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Dubai", day: "2-digit", month: "short", year: "numeric"
        });
        const timeFormatter = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
        });
        const updateDubaiClock = () => {
            const now = new Date();
            const dateParts = Object.fromEntries(dateFormatter.formatToParts(now)
                .filter(part => part.type !== "literal").map(part => [part.type, part.value]));
            const timeParts = Object.fromEntries(timeFormatter.formatToParts(now)
                .filter(part => part.type !== "literal").map(part => [part.type, part.value]));
            const dateLabel = [dateParts.day, dateParts.month.toUpperCase(), dateParts.year].join(" ");
            const timeLabel = [timeParts.hour, timeParts.minute, timeParts.second].join(":");
            dubaiDate.textContent = "SYSTEM DATE: " + dateLabel + " · DUBAI TIME: " + timeLabel + " UTC+04:00";
            window.setTimeout(updateDubaiClock, Math.max(100, 1000 - (Date.now() % 1000) + 15));
        };
        updateDubaiClock();
    }

    // Theme preference is shared across every route on this domain.
    const themeButtons = document.querySelectorAll(".theme-toggle");
    const applyTheme = theme => {
        const activeTheme = theme === "light" ? "light" : "dark";
        document.documentElement.dataset.theme = activeTheme;
        themeButtons.forEach(button => {
            const lightMode = activeTheme === "light";
            const icon = button.querySelector(".theme-toggle-icon");
            const label = button.querySelector(".theme-toggle-label");
            if (icon) icon.textContent = lightMode ? "☾" : "☼";
            if (label) label.textContent = lightMode ? "Dark" : "Light";
            button.setAttribute("aria-label", lightMode ? "Switch to dark mode" : "Switch to light mode");
            button.setAttribute("aria-pressed", String(lightMode));
            button.setAttribute("title", lightMode ? "Switch to dark mode" : "Switch to light mode");
        });
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute("content", activeTheme === "light" ? "#f7f5fb" : "#07060b");
        window.dispatchEvent(new CustomEvent("portfolio-theme-change", { detail: { theme: activeTheme } }));
    };
    applyTheme(document.documentElement.dataset.theme);
    themeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
            applyTheme(nextTheme);
            try { localStorage.setItem("portfolio-theme", nextTheme); } catch (error) {}
        });
    });

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
            // Scope disclosure closing to compact layouts so desktop navigation state
            // is not mutated when a route link is activated.
            if (mobileNavigation.matches && event.target instanceof Element && event.target.closest("a")) {
                setNavigationOpen(false);
            }
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

    // Matrix rain runs in the homepage hero and as a subtle shared background on inner pages.
    const hero = document.querySelector(".hero");
    const matrixMotionSuppressed = () => !visualEffectsEnabled;
    document.querySelectorAll("canvas.hero-matrix, canvas.site-matrix").forEach(canvas => {
        if (typeof canvas.getContext !== "function" || canvas.dataset.matrixInitialized === "true") return;
        let context = null;
        try { context = canvas.getContext("2d"); }
        catch (error) { console.warn("Matrix background unavailable; other page interactions remain enabled.", error); }
        if (!context) return;

        canvas.dataset.matrixInitialized = "true";
        const isHeroCanvas = canvas.classList.contains("hero-matrix");
        const container = isHeroCanvas ? canvas.closest(".hero") : null;
        const symbols = "01<>[]{}ABCDEFGHIJKLMNOPQRSTUVWXYZ$#%";
        const fontSize = 13, columnWidth = 17;
        const compactQuery = window.matchMedia("(max-width: 700px)");
        let width = 0, height = 0, ratio = 1, drops = [], glyphs = [], rafId = null, timerId = null, lastDrawAt = 0;
        let resizeObserver = null;
        const randomGlyph = () => symbols[Math.floor(Math.random() * symbols.length)];
        const stopMatrix = () => {
            if (rafId !== null) window.cancelAnimationFrame(rafId);
            if (timerId !== null) window.clearTimeout(timerId);
            rafId = null; timerId = null; lastDrawAt = 0;
        };
        const getCanvasBounds = () => {
            if (container) {
                const rect = container.getBoundingClientRect();
                const baseWidth = Math.max(1, Math.round(rect.width));
                return {
                    baseWidth,
                    width: Math.round(baseWidth * 1.08),
                    height: Math.max(1, Math.round(rect.height))
                };
            }
            return {
                baseWidth: Math.max(1, document.documentElement.clientWidth || window.innerWidth),
                width: Math.max(1, document.documentElement.clientWidth || window.innerWidth),
                height: Math.max(1, window.innerHeight)
            };
        };
        const drawMatrix = advance => {
            if (!context || !width || !height) return;
            context.clearRect(0, 0, width, height);
            const compact = compactQuery.matches, stride = compact ? 2 : 1;
            context.font = fontSize + 'px "JetBrains Mono", monospace';
            for (let column = 0; column < drops.length; column += stride) {
                const y = drops[column] * fontSize;
                for (let trail = 0; trail < 8; trail++) {
                    const charY = y - trail * fontSize;
                    if (charY < -fontSize || charY > height + fontSize) continue;
                    if (advance && Math.random() < 0.02) glyphs[column][trail] = randomGlyph();
                    const lightTheme = document.documentElement.dataset.theme === "light";
                    const alpha = (lightTheme ? (0.46 - trail * 0.045) : (0.27 - trail * 0.028)) * (compact ? 0.72 : 1);
                    context.fillStyle = column % 6 === 0
                        ? (lightTheme ? "rgba(99, 57, 157, " + alpha + ")" : "rgba(173, 130, 255, " + alpha + ")")
                        : (lightTheme ? "rgba(23, 119, 57, " + alpha + ")" : "rgba(91, 255, 145, " + alpha + ")");
                    context.fillText(glyphs[column][trail], column * columnWidth, charY);
                }
                if (advance) {
                    // 10% faster drop speed than the previous homepage animation.
                    drops[column] += compact ? 0.264 : 0.341;
                    if (drops[column] * fontSize > height + fontSize * 5 && Math.random() > 0.975) {
                        drops[column] = -Math.random() * 8;
                    }
                }
            }
        };
        const resizeMatrix = force => {
            const bounds = getCanvasBounds();
            const nextWidth = bounds.width, nextHeight = bounds.height;
            if (!force && nextWidth === width && nextHeight === height && drops.length) return;
            width = nextWidth; height = nextHeight;
            ratio = Math.min(window.devicePixelRatio || 1, compactQuery.matches ? 1 : 1.25);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            canvas.style.left = container ? -Math.round((width - bounds.baseWidth) / 2) + "px" : "0px";
            canvas.style.right = "auto";
            canvas.style.top = "0px";
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            const columns = Math.ceil(width / columnWidth);
            drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));
            glyphs = Array.from({ length: columns }, () => Array.from({ length: 8 }, randomGlyph));
            drawMatrix(false);
        };
        const scheduleMatrix = () => {
            if (rafId !== null || timerId !== null || matrixMotionSuppressed() || document.visibilityState === "hidden") return;
            timerId = window.setTimeout(() => {
                timerId = null;
                if (!matrixMotionSuppressed() && document.visibilityState !== "hidden") {
                    rafId = window.requestAnimationFrame(animateMatrix);
                }
            }, compactQuery.matches ? 65 : 38);
        };
        const animateMatrix = timestamp => {
            rafId = null;
            if (matrixMotionSuppressed() || document.visibilityState === "hidden") return;
            const minInterval = compactQuery.matches ? 1000 / 14 : 1000 / 24;
            if (!lastDrawAt || timestamp - lastDrawAt >= minInterval) {
                drawMatrix(true);
                lastDrawAt = timestamp;
            }
            scheduleMatrix();
        };
        const refreshMatrix = () => {
            stopMatrix();
            if (matrixMotionSuppressed()) drawMatrix(false);
            else if (document.visibilityState !== "hidden") scheduleMatrix();
        };
        const refreshForMotionOrSize = () => { resizeMatrix(true); refreshMatrix(); };
        window.addEventListener("portfolio-theme-change", () => drawMatrix(false));

        resizeMatrix(true);
        refreshMatrix();
        if (container && "ResizeObserver" in window) {
            resizeObserver = new ResizeObserver(() => resizeMatrix(false));
            resizeObserver.observe(container);
        }
        window.addEventListener("resize", () => resizeMatrix(false), { passive: true });
        document.addEventListener("visibilitychange", refreshMatrix);
        window.addEventListener("pagehide", stopMatrix);
        window.addEventListener("pageshow", refreshMatrix);
        if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", refreshMatrix);
        else if (reducedMotion.addListener) reducedMotion.addListener(refreshMatrix);
        if (compactQuery.addEventListener) compactQuery.addEventListener("change", refreshForMotionOrSize);
        else if (compactQuery.addListener) compactQuery.addListener(refreshForMotionOrSize);
    });

    // One site-wide cursor glow, reusing one scheduled animation frame.
    const glowBody=document.body,finePointer=window.matchMedia("(pointer: fine)");
    if(glowBody&&glowBody.dataset.cursorGlowInitialized!=="true"){
        glowBody.dataset.cursorGlowInitialized="true";
        let pointerFrame=null,pointerPoint=null,active=false;
        const hideGlow=()=>{
            active=false;pointerPoint=null;
            if(pointerFrame!==null)window.cancelAnimationFrame(pointerFrame);
            pointerFrame=null;glowBody.classList.remove("has-global-cursor-glow");
            glowBody.style.setProperty("--site-cursor-x","-1000px");glowBody.style.setProperty("--site-cursor-y","-1000px");
        };
        const paintGlow=()=>{
            pointerFrame=null;if(!pointerPoint||motionSuppressed())return;
            glowBody.style.setProperty("--site-cursor-x",pointerPoint.x+"px");
            glowBody.style.setProperty("--site-cursor-y",pointerPoint.y+"px");
            if(!active){active=true;glowBody.classList.add("has-global-cursor-glow");}
        };
        document.addEventListener("pointermove",event=>{
            if(!finePointer.matches||motionSuppressed()||(event.pointerType!=="mouse"&&event.pointerType!=="pen"))return;
            pointerPoint={x:event.clientX,y:event.clientY};
            if(hero && hero.contains(event.target)) {
                const rect=hero.getBoundingClientRect();
                hero.style.setProperty("--pointer-x",(event.clientX-rect.left)+"px");
                hero.style.setProperty("--pointer-y",(event.clientY-rect.top)+"px");
            }
            if(pointerFrame===null)pointerFrame=window.requestAnimationFrame(paintGlow);
        },{passive:true});
        document.addEventListener("pointerout",event=>{if(!event.relatedTarget)hideGlow();},{passive:true});
        document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")hideGlow();});
        window.addEventListener("blur",hideGlow);
        const refreshGlowAvailability=()=>{if(!finePointer.matches||motionSuppressed())hideGlow();};
        if(reducedMotion.addEventListener)reducedMotion.addEventListener("change",refreshGlowAvailability);
        else if(reducedMotion.addListener)reducedMotion.addListener(refreshGlowAvailability);
        if(finePointer.addEventListener)finePointer.addEventListener("change",refreshGlowAvailability);
        else if(finePointer.addListener)finePointer.addListener(refreshGlowAvailability);
    }

    // Reduce repeated brand animation to a user-driven hover/focus effect, not a persistent glitch.
    if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener("change", () => {
            if (prefersReducedMotion() && !visualEffectsEnabled && hero) {
                hero.style.removeProperty("--pointer-x");
                hero.style.removeProperty("--pointer-y");
            }
        });
    }
});
