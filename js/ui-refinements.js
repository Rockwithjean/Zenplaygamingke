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

    // 2. Dynamic RGB Glow for interactive elements (optional JS enhancement)
    // We already handled basic glows in CSS, but we could add mouse-following glows here if requested.
    
    console.log('ZenPlay UI Refinements Loaded.');
});
