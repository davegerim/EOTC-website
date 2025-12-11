import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { galleryData } from './gallery-data.js' // Import data

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initPreloader();
    initCustomCursor();
    initMagneticElements();
    initMenu();
    initScrollAnimations();
    initMarquee();

    // Check if we are on the works page
    if (document.querySelector('.works-hero')) {
        initWorksHero();
    }

    // Check if gallery grid exists
    if (document.getElementById('portfolio-grid')) {
        initDynamicGallery();
    }

    // Check if heritage page (support both old and new hero class names)
    if (document.querySelector('.heritage-hero') || document.querySelector('.heritage-hero-unique') || document.querySelector('.horizontal-timeline')) {
        initHeritagePage();
    }
});

function initHeritagePage() {
    // 1. HORIZONTAL SCROLL TIMELINE
    const track = document.querySelector('.timeline-track');
    const timelineSection = document.querySelector('.horizontal-timeline');

    const canHorizontalScroll = track && timelineSection && window.matchMedia("(min-width: 1024px)").matches;

    if (canHorizontalScroll) {
        timelineSection.classList.remove('timeline-vertical');
        track.classList.remove('timeline-vertical-track');

        function getScrollAmount() {
            return -(track.scrollWidth - window.innerWidth);
        }

        gsap.to(track, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: timelineSection,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                end: () => "+=" + (track.scrollWidth - window.innerWidth)
            }
        });
    } else if (timelineSection) {
        // Fallback to vertical stacking if horizontal scroll isn't available
        timelineSection.classList.add('timeline-vertical');
        track?.classList.add('timeline-vertical-track');
    }

    // 2. SCRIPTORIUM SPOTLIGHT INTERACTION
    const showcase = document.querySelector('.manuscript-showcase');
    if (showcase) {
        const mainImg = showcase.querySelector('.spotlight-img');
        const thumbs = showcase.querySelectorAll('.mini-thumb');

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Update active state
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');

                // Crossfade image
                gsap.to(mainImg, {
                    opacity: 0, duration: 0.3, onComplete: () => {
                        mainImg.src = thumb.src;
                        gsap.to(mainImg, { opacity: 1, duration: 0.3 });
                    }
                });
            });
        });
    }

    // 3. Artifact Float Parallax (Mouse movement)
    const hero = document.querySelector('.heritage-hero-unique');
    const artifact = document.querySelector('.floating-artifact');

    if (hero && artifact) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) * 0.05;
            const y = (e.clientY - window.innerHeight / 2) * 0.05;

            gsap.to(artifact, {
                x: x,
                y: y,
                rotationY: x * 0.5,
                duration: 1,
                ease: "power2.out"
            });
        });
    }
}

function initWorksHero() {
    const tl = gsap.timeline();

    tl.to('.title-inner', {
        y: '0%',
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.15,
        delay: 0.2
    })
        .to('.separator-line', {
            width: '60px',
            duration: 0.8,
            ease: "power3.out"
        }, "-=1.0")
        .to(['.amharic-sub-hero', '.works-sub'], {
            opacity: 1,
            x: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.6")
        .to('.hero-badge', {
            opacity: 1,
            rotation: 360,
            duration: 1.5,
            ease: "power2.out"
        }, "-=1.2")
        .to('.scroll-down-indicator', {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, "-=0.4");

    // Optional: Mouse Move Parallax for Title & Background Text
    const heroSection = document.querySelector('.works-hero');
    const title = document.querySelector('.works-title');
    const bgText = document.querySelector('.bg-amharic-text');

    if (heroSection && !window.matchMedia("(pointer: coarse)").matches) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) * 0.02;
            const y = (e.clientY - window.innerHeight / 2) * 0.02;

            // Move title slightly
            if (title) gsap.to(title, { x: x, y: y, duration: 1, ease: "power2.out" });

            // Move huge background text slower for depth
            if (bgText) gsap.to(bgText, { x: -x * 2, y: -y * 2, duration: 1.5, ease: "power2.out" });
        });
    }
}

/* --- Dynamic Gallery Logic --- */
function initDynamicGallery() {
    const grid = document.getElementById('portfolio-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreWrapper = document.querySelector('.load-more-wrapper');

    let currentPage = 0;
    const itemsPerPage = 8; // Adjust batch size
    const totalItems = galleryData.length;

    // Masonry Pattern Cycle (6 items pattern)
    // 0: Double, 1: Single Top, 2: Single, 3: Double Down, 4: Double, 5: Single Top
    const pattern = [
        "double-w",
        "single-w offset-top",
        "single-w",
        "double-w offset-down",
        "double-w",
        "single-w offset-top"
    ];

    function renderItems() {
        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalItems);
        const batch = galleryData.slice(start, end);

        if (batch.length === 0) return;

        batch.forEach((item, index) => {
            // Calculate pattern index based on global index
            const globalIndex = start + index;
            const patternClass = pattern[globalIndex % pattern.length];

            const div = document.createElement('div');
            // Add base class and dynamic pattern class
            div.className = `portfolio-item ${patternClass}`;

            div.innerHTML = `
                <div class="item-img-wrapper cursor-view">
                    <img src="${item.src}" alt="${item.title}" class="parallax-img" loading="lazy">
                </div>
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <span class="category">${item.category}</span>
                </div>
            `;

            grid.appendChild(div);

            // Re-initialize hover effects for new elements
            const newImgWrapper = div.querySelector('.cursor-view');
            newImgWrapper.addEventListener('mouseenter', () => document.body.classList.add('hover-view'));
            newImgWrapper.addEventListener('mouseleave', () => document.body.classList.remove('hover-view'));

            // Animate entry
            gsap.from(div, {
                y: 100,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                delay: index * 0.1
            });
        });

        // Refresh ScrollTrigger for new parallax images
        ScrollTrigger.refresh();
        initScrollAnimations(); // Re-bind parallax to new images

        // Update state
        currentPage++;

        // Hide button if no more items
        if (itemsPerPage * currentPage >= totalItems) {
            loadMoreWrapper.style.display = 'none';
        } else {
            loadMoreWrapper.style.display = 'block';
        }
    }

    // Initial Load
    renderItems();

    loadMoreBtn.addEventListener('click', () => {
        renderItems();
    });
}


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
