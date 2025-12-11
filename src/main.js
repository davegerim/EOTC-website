import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initPreloader();
    initCustomCursor();
    initMagneticElements();
    initMenu();
    initScrollAnimations();
    initMarquee();
});

function initLenis() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

function initPreloader() {
    const tl = gsap.timeline();
    // Counter animation
    const countElement = document.querySelector('.count');
    let count = { val: 0 };

    tl.to(count, {
        val: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
            countElement.innerText = Math.floor(count.val);
        }
    })
        .to('.preloader-content', { y: -100, opacity: 0, duration: 0.5 })
        .to('.preloader', { height: 0, duration: 1, ease: "power4.inOut" })
        .from('.line', { height: 0, duration: 1.5, stagger: 0.2, ease: "power3.inOut" }, "-=0.5")
        .from('.hero-title .line span', { y: 150, skewY: 10, duration: 1.5, stagger: 0.1, ease: "power4.out" }, "-=1.0")
        .from('.hero-bg-wrapper', { scale: 1.5, opacity: 0, duration: 1.5, ease: "power2.out" }, "-=1.5");
}

function initCustomCursor() {
    const follower = document.querySelector('.cursor-follower');
    const dot = document.querySelector('.cursor-dot');
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.1 });
    });

    gsap.ticker.add(() => {
        posX += (mouseX - posX) * 0.1;
        posY += (mouseY - posY) * 0.1;
        gsap.set(follower, { x: posX, y: posY });
    });

    const links = document.querySelectorAll('a, button, .menu-toggle, .cursor-view');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => document.body.classList.add('hover-magnet'));
        link.addEventListener('mouseleave', () => document.body.classList.remove('hover-magnet'));
    });

    const views = document.querySelectorAll('.cursor-view');
    views.forEach(view => {
        view.addEventListener('mouseenter', () => document.body.classList.add('hover-view'));
        view.addEventListener('mouseleave', () => document.body.classList.remove('hover-view'));
    });
}

function initMagneticElements() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const magnets = document.querySelectorAll('.magnetic');
    magnets.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const strength = el.getAttribute('data-strength') || 30;
            gsap.to(el, { x: x * (strength / 100), y: y * (strength / 100), duration: 0.5, ease: "power2.out" });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });
}

// Updated Menu Animation for 3 Columns - More Robust
function initMenu() {
    const toggle = document.querySelector('.menu-toggle-wrapper');
    const closeBtn = document.querySelector('.close-menu-btn');
    const overlay = document.querySelector('.menu-overlay');
    const overlayBg = document.querySelector('.menu-overlay-bg');
    const cols = document.querySelector('.menu-cols');
    const links = document.querySelectorAll('.menu-link');
    let isOpen = false;

    const toggleMenu = () => {
        isOpen = !isOpen;
        if (isOpen) {
            gsap.set(overlay, { visibility: 'visible' });

            // Set initial states explicitly to ensure they are ready for animation
            gsap.set(cols, { opacity: 0 });
            gsap.set('.menu-col', { y: 50, opacity: 0 });
            gsap.set(links, { x: -30, opacity: 0 });

            const tl = gsap.timeline();
            tl.to(overlayBg, { y: '0%', duration: 0.8, ease: "power4.inOut" })
                .to(cols, { opacity: 1, duration: 0.5 })
                .to('.menu-col', { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" }, "-=0.4")
                .to(links, { x: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }, "-=0.6");
        } else {
            // Animate closing
            gsap.to(links, { opacity: 0, duration: 0.2 });
            gsap.to(overlayBg, {
                y: '-100%', duration: 0.8, ease: "power4.inOut", delay: 0.1, onComplete: () => {
                    gsap.set(overlay, { visibility: 'hidden' });
                    gsap.set(cols, { opacity: 0 });
                    gsap.set(links, { clearProps: "all" }); // Cleanup
                }
            });
        }
    };

    toggle.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', () => { setTimeout(toggleMenu, 100); });
    });
}

function initScrollAnimations() {
    gsap.utils.toArray('.parallax-img').forEach(img => {
        const parent = img.parentElement;
        gsap.fromTo(img,
            { yPercent: -20 },
            { yPercent: 20, ease: "none", scrollTrigger: { trigger: parent, start: "top bottom", end: "bottom top", scrub: true } }
        );
    });

    gsap.utils.toArray('.reveal-fade').forEach(el => {
        gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
}

function initMarquee() {
    const track = document.querySelector('.marquee-inner');
    if (!track) return;
    const content = track.innerHTML;
    track.innerHTML = content + content + content;
    gsap.to(track, { xPercent: -50, ease: "none", duration: 20, repeat: -1 });
}
