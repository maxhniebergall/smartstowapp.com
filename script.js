// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
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

    // Beta Signup Form Handler
    const betaForm = document.getElementById('betaSignupForm');

    if (betaForm) {
        const API_URL = 'https://smartstow-backend-589274766301.us-central1.run.app/api/beta-signup';
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const loader = document.getElementById('loader');
        const messageDiv = document.getElementById('message');

        betaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const agreedToTerms = document.getElementById('agreedToTerms').checked;
            const agreedToPrivacy = document.getElementById('agreedToPrivacy').checked;

            // Validate checkboxes
            if (!agreedToTerms || !agreedToPrivacy) {
                showMessage('Please agree to the Terms and Conditions and Privacy Policy', 'error');
                return;
            }

            // Show loading state
            setLoading(true);
            hideMessage();

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        agreedToTerms,
                        agreedToPrivacy
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message || 'Thank you! We\'ll be in touch soon.', 'success');
                    betaForm.reset();
                } else {
                    showMessage(data.error || 'Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showMessage('Network error. Please check your connection and try again.', 'error');
            } finally {
                setLoading(false);
            }
        });

        function setLoading(isLoading) {
            submitBtn.disabled = isLoading;
            if (isLoading) {
                btnText.style.display = 'none';
                loader.style.display = 'block';
            } else {
                btnText.style.display = 'inline';
                loader.style.display = 'none';
            }
        }

        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type} show`;
        }

        function hideMessage() {
            messageDiv.className = 'message';
        }
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
