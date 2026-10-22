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
    const effectsToggle = document.getElementById("visual-effects-toggle");
    let visualEffectsEnabled = !prefersReducedMotion();
    let userSelectedVisualEffects = false;
    const motionSuppressed = () => prefersReducedMotion() && !visualEffectsEnabled;
    const syncVisualEffectsControl = () => {
        document.documentElement.dataset.visualEffects = visualEffectsEnabled ? "on" : "off";
        if (effectsToggle) {
            effectsToggle.textContent = visualEffectsEnabled ? "Effects: On" : "Effects: Off";
            effectsToggle.setAttribute("aria-pressed", String(visualEffectsEnabled));
            effectsToggle.setAttribute("aria-label", visualEffectsEnabled
                ? "Turn off Matrix background, cursor glow, and phase animations"
                : "Turn on Matrix background, cursor glow, and phase animations");
        }
    };
    const notifyVisualEffectsChange = () => {
        syncVisualEffectsControl();
        document.dispatchEvent(new CustomEvent("portfolio:visual-effects-change", {
            detail: { enabled: visualEffectsEnabled }
        }));
    };
    syncVisualEffectsControl();
    if (effectsToggle) {
        effectsToggle.addEventListener("click", () => {
            userSelectedVisualEffects = true;
            visualEffectsEnabled = !visualEffectsEnabled;
            notifyVisualEffectsChange();
        });
    }
    const refreshForMotionPreference = () => {
        if (!userSelectedVisualEffects) visualEffectsEnabled = !prefersReducedMotion();
        notifyVisualEffectsChange();
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", refreshForMotionPreference);
    else if (reducedMotion.addListener) reducedMotion.addListener(refreshForMotionPreference);

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

    // Matrix rain: stable glyph trails, a bounded draw cadence, and a single scheduled frame.
    const hero = document.querySelector(".hero");
    const canvas = document.getElementById("hero-matrix");
    if (hero && canvas && typeof canvas.getContext === "function" && canvas.dataset.matrixInitialized !== "true") {
        let context = null;
        try { context = canvas.getContext("2d"); }
        catch (error) { console.warn("Matrix background unavailable; other homepage interactions remain enabled.", error); }
        if (context) {
            canvas.dataset.matrixInitialized = "true";
            const symbols = "01<>[]{}ABCDEFGHIJKLMNOPQRSTUVWXYZ$#%";
            const fontSize = 13, columnWidth = 17;
            const compactQuery = window.matchMedia("(max-width: 700px)");
            let width=0,height=0,ratio=1,drops=[],glyphs=[],rafId=null,timerId=null,lastDrawAt=0,resizeObserver=null;
            const randomGlyph=()=>symbols[Math.floor(Math.random()*symbols.length)];
            const stopMatrix=()=>{
                if(rafId!==null)window.cancelAnimationFrame(rafId);
                if(timerId!==null)window.clearTimeout(timerId);
                rafId=null;timerId=null;lastDrawAt=0;
            };
            const drawMatrix=advance=>{
                if(!context||!width||!height)return;
                context.clearRect(0,0,width,height);
                const compact=compactQuery.matches,stride=compact?2:1;
                context.font=fontSize+'px "JetBrains Mono", monospace';
                for(let column=0;column<drops.length;column+=stride){
                    const y=drops[column]*fontSize;
                    for(let trail=0;trail<8;trail++){
                        const charY=y-trail*fontSize;
                        if(charY < -fontSize || charY > height+fontSize)continue;
                        if(advance&&Math.random()<0.02)glyphs[column][trail]=randomGlyph();
                        const alpha=(0.27-trail*0.028)*(compact?0.72:1);
                        context.fillStyle=column%6===0
                            ? "rgba(173, 130, 255, "+alpha+")"
                            : "rgba(91, 255, 145, "+alpha+")";
                        context.fillText(glyphs[column][trail],column*columnWidth,charY);
                    }
                    if(advance){
                        drops[column]+=compact?0.24:0.31;
                        if(drops[column]*fontSize>height+fontSize*5&&Math.random()>0.975)drops[column]=-Math.random()*8;
                    }
                }
            };
            const resizeMatrix=force=>{
                const rect=hero.getBoundingClientRect(),nextWidth=Math.max(1,Math.round(rect.width)),nextHeight=Math.max(1,Math.round(rect.height));
                if(!force&&nextWidth===width&&nextHeight===height&&drops.length)return;
                width=nextWidth;height=nextHeight;
                ratio=Math.min(window.devicePixelRatio||1,compactQuery.matches?1:1.25);
                canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
                canvas.style.width=width+"px";canvas.style.height=height+"px";
                context.setTransform(ratio,0,0,ratio,0,0);
                const columns=Math.ceil(width/columnWidth);
                drops=Array.from({length:columns},()=>Math.random()*(height/fontSize));
                glyphs=Array.from({length:columns},()=>Array.from({length:8},randomGlyph));
                drawMatrix(false);
            };
            const scheduleMatrix=()=>{
                if(rafId!==null||timerId!==null||motionSuppressed()||document.visibilityState==="hidden")return;
                timerId=window.setTimeout(()=>{
                    timerId=null;
                    if(!motionSuppressed()&&document.visibilityState!=="hidden")rafId=window.requestAnimationFrame(animateMatrix);
                },compactQuery.matches?65:38);
            };
            const animateMatrix=timestamp=>{
                rafId=null;
                if(motionSuppressed()||document.visibilityState==="hidden")return;
                const minInterval=compactQuery.matches?1000/14:1000/24;
                if(!lastDrawAt||timestamp-lastDrawAt>=minInterval){drawMatrix(true);lastDrawAt=timestamp;}
                scheduleMatrix();
            };
            const refreshMatrix=()=>{
                stopMatrix();
                if(motionSuppressed())drawMatrix(false);
                else if(document.visibilityState!=="hidden")scheduleMatrix();
            };
            resizeMatrix(true);refreshMatrix();
            if("ResizeObserver"in window){resizeObserver=new ResizeObserver(()=>resizeMatrix(false));resizeObserver.observe(hero);}
            else window.addEventListener("resize",()=>resizeMatrix(false),{passive:true});
            document.addEventListener("visibilitychange",refreshMatrix);
            document.addEventListener("portfolio:visual-effects-change",refreshMatrix);
            window.addEventListener("pagehide",stopMatrix);window.addEventListener("pageshow",refreshMatrix);
            const refreshForMotionOrSize=()=>{resizeMatrix(true);refreshMatrix();};
            if(reducedMotion.addEventListener)reducedMotion.addEventListener("change",refreshMatrix);
            else if(reducedMotion.addListener)reducedMotion.addListener(refreshMatrix);
            if(compactQuery.addEventListener)compactQuery.addEventListener("change",refreshForMotionOrSize);
            else if(compactQuery.addListener)compactQuery.addListener(refreshForMotionOrSize);
        }
    }

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
        document.addEventListener("portfolio:visual-effects-change",refreshGlowAvailability);
        if(reducedMotion.addEventListener)reducedMotion.addEventListener("change",refreshGlowAvailability);
        else if(reducedMotion.addListener)reducedMotion.addListener(refreshGlowAvailability);
        if(finePointer.addEventListener)finePointer.addEventListener("change",refreshGlowAvailability);
        else if(finePointer.addListener)finePointer.addListener(refreshGlowAvailability);
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
