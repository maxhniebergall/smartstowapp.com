// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        // Toggle menu when hamburger is clicked
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('nav-active');
        });

        // Close menu when a nav link is clicked
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('nav-active');
            });
        });
    }

    // Smooth scroll for all anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation when elements come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe feature cards
    const cards = document.querySelectorAll('.feature-card');
    
    // Add animation preparation class and observe
    cards.forEach(card => {
        // Check if card is already in viewport
        const rect = card.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport) {
            // If already in viewport, show immediately without animation
            card.classList.add('fade-in');
        } else {
            // Otherwise, prepare for scroll animation
            card.classList.add('animate-on-scroll');
            observer.observe(card);
        }
    });

    // Download button handler
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            window.location.href = 'https://github.com/maxhniebergall/smartstowapp.com/releases/download/AndroidBeta1.1/SmartStow1.1.apk';
        });
    }
});

// Add fade-in animation styles
const style = document.createElement('style');
style.textContent = `
    .feature-card.animate-on-scroll {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .feature-card.animate-on-scroll.fade-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
