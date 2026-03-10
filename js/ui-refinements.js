/**
 * ZenPlay Gaming Lounge - UI/UX Refinements
 * Built for 2026 Gaming Aesthetics
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Scroll Animations
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Once normalized, we can unobserve if we only want it to happen once
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Navbar Scroll Effect (Immediate visibility on scroll)
    const navbar = document.querySelector('.navbar.fixed-top');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('bg-black');
            } else {
                navbar.classList.remove('bg-black');
            }
        });
    }

    console.log('ZenPlay UI Refinements Loaded.');
});
