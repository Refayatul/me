// Initialize UI Elements
const typewriterElement = document.getElementById('typewriter');
const progressBar = document.querySelector('.progress-bar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

// Theme related elements
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const themeIcon = themeToggle?.querySelector('i');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

// Intersection Observer Setup for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animationObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Project Filtering Elements
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

// Mobile Navigation
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Scroll to Top Button
const scrollButton = document.createElement('button');
scrollButton.innerHTML = '↑';
scrollButton.className = 'scroll-top';
document.body.appendChild(scrollButton);

const scrollButtonStyles = document.createElement('style');
scrollButtonStyles.textContent = `
    .scroll-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: none;
        font-size: 20px;
        transition: var(--transition);
        z-index: 1000;
    }
    .scroll-top:hover {
        transform: translateY(-5px);
    }
`;
document.head.appendChild(scrollButtonStyles);

// Theme Toggle Function
function updateThemeIcon(isDark) {
    if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Theme Toggle Setup
if (themeToggle) {
    if (savedTheme) {
        html.dataset.theme = savedTheme;
        updateThemeIcon(savedTheme === 'dark');
    } else if (prefersDark) {
        html.dataset.theme = 'dark';
        updateThemeIcon(true);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = html.dataset.theme === 'dark';
        html.dataset.theme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', html.dataset.theme);
        updateThemeIcon(!isDark);
    });

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.dataset.theme = e.matches ? 'dark' : 'light';
            updateThemeIcon(e.matches);
        }
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (navLinks && navToggle) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            }
        }
    });
});

// Scroll Events
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Navbar scroll effect
    if (navbar) {
        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
    }
    
    // Progress bar update
    if (progressBar) {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    }
    
    // Scroll to top button visibility
    if (currentScroll > 300) {
        scrollButton.style.display = 'block';
    } else {
        scrollButton.style.display = 'none';
    }
    
    lastScroll = currentScroll;
});

// Scroll to top when button is clicked
scrollButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Project Filtering
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');
        
        projectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.display = 'block';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Typewriter Effect
function typeWriter(text, speed = 100) {
    if (!typewriterElement) return;
    
    let i = 0;
    typewriterElement.textContent = '';
    
    function type() {
        if (i < text.length) {
            typewriterElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

if (typewriterElement) {
    const text = typewriterElement.textContent;
    setTimeout(() => {
        typeWriter(text);
    }, 1000);
}

// Initialize animations
document.querySelectorAll('section, .project-card, .skill-category, .timeline-item, .volunteer-item')
    .forEach(element => {
        element.classList.add('fade-in');
        animationObserver.observe(element);
    });

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(animationStyles);