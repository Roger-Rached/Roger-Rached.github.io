document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Responsive navigation is a disclosure, not a modal: keyboard users can
    // continue tabbing naturally, and Escape closes it and restores focus.
    const navbar = document.querySelector(".navbar");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const mobileNavigation = window.matchMedia("(max-width: 950px)");

    if (navbar && navToggle && navLinks) {
        // The CSS leaves all links visible if JavaScript is unavailable.
        navbar.classList.add("has-mobile-nav");

        const setNavigationOpen = (isOpen) => {
            navbar.classList.toggle("nav-open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        };

        navToggle.addEventListener("click", () => {
            const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
            setNavigationOpen(isOpen);

            if (isOpen && mobileNavigation.matches) {
                navLinks.querySelector("a")?.focus();
            }
        });

        navLinks.addEventListener("click", (event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
                setNavigationOpen(false);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
                setNavigationOpen(false);
                navToggle.focus();
            }
        });

        document.addEventListener("click", (event) => {
            if (
                navToggle.getAttribute("aria-expanded") === "true" &&
                event.target instanceof Node &&
                !navbar.contains(event.target)
            ) {
                setNavigationOpen(false);
            }
        });

        window.addEventListener("resize", () => {
            if (!mobileNavigation.matches) {
                setNavigationOpen(false);
            }
        });
    }

    // Scroll reveals are progressive enhancement; content remains visible
    // without JavaScript, without IntersectionObserver, or with reduced motion.
    const revealElements = document.querySelectorAll(
        ".focus-card, .writeup-item, .project-card, .research-box"
    );

    if (!prefersReducedMotion && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        revealElements.forEach((element) => {
            element.classList.add("reveal");
            observer.observe(element);
        });
    }

    // The terminal tilt is decorative; do not run it for users who request
    // reduced motion or on devices without a precise pointer.
    const hero = document.querySelector(".hero");
    if (hero && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
        const terminalElement = hero.querySelector(".hero-terminal");

        if (terminalElement) {
            hero.addEventListener("mousemove", (event) => {
                const rect = hero.getBoundingClientRect();
                if (!rect.width || !rect.height) return;

                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;

                terminalElement.style.transform =
                    `perspective(1000px) rotateY(${-3 + x * 0.08}deg) rotateX(${y * -0.04}deg)`;
            });

            hero.addEventListener("mouseleave", () => {
                terminalElement.style.transform = "perspective(1000px) rotateY(-3deg)";
            });
        }
    }
});
