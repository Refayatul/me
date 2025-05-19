document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const typewriterElement = document.getElementById('typewriter');
    const progressBar = document.querySelector('.progress-bar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const allNavLinks = document.querySelectorAll('.nav-links .nav-link'); // Specific for nav items
    const navbar = document.querySelector('.navbar');
    const html = document.documentElement;

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('themeToggle'); 
    const themeIcon = themeToggle?.querySelector('i');

    function updateThemeIcon(isDark) {
        if (themeIcon) {
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    function applyTheme(theme) {
        html.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme === 'dark');
    }

    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = html.dataset.theme;
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // --- Intersection Observer for Animations ---
    const observerOptions = {
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // We removed data-aos-delay for simplicity, relying on CSS for any staggering if needed
                // or can be added back if complex JS-driven staggering is desired.
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.aos-item').forEach(item => {
        animationObserver.observe(item);
    });

    // --- Mobile Navigation ---
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation(); 
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('a.nav-link').forEach(link => { // Target only actual nav links
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navToggle.contains(e.target) && 
                !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // --- Scroll to Top Button ---
    const scrollButton = document.querySelector('.scroll-top-btn');
    if (scrollButton) {
        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // --- Active Nav Link Highlighting & Smooth Scrolling ---
    const sections = document.querySelectorAll('main section[id]');

    function changeNavActiveState() {
        let index = sections.length;
        const navbarHeight = navbar ? navbar.offsetHeight : 70;

        while(--index >= 0 && window.scrollY + navbarHeight + 50 < sections[index].offsetTop) {} // Ensure index doesn't go below 0
        
        allNavLinks.forEach((link) => link.classList.remove('active'));
        
        if (index >= 0 && sections[index]) { // Check if sections[index] exists
            const activeLink = document.querySelector(`.nav-links a.nav-link[href="#${sections[index].id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        } else if (window.scrollY < (sections[0] ? sections[0].offsetTop - navbarHeight - 50 : 500) && allNavLinks[0]) {
             // If very top (or no sections yet), highlight Home
            allNavLinks[0].classList.add('active');
        }
    }
    if(sections.length > 0) changeNavActiveState(); // Initial call only if sections exist


    document.querySelectorAll('a[href^="#"]').forEach(anchor => { // Includes nav-links and cta-buttons
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#" || href === "" || href.length < 2) return; // Basic check

            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                const navbarHeight = navbar ? navbar.offsetHeight : 70;
                let elementPosition = targetElement.getBoundingClientRect().top;
                let offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
                
                // Small adjustment to prevent title from being exactly at the edge
                if (href !== "#home") { // Don't adjust for home, scroll to very top
                    offsetPosition -= 10; 
                }


                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (navLinks && navLinks.classList.contains('active') && !this.closest('.nav-toggle')) {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });

    // --- Scroll Events Listener ---
    let lastScrollY = window.pageYOffset;
    const SCROLL_THRESHOLD_NAVBAR = 10;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.pageYOffset;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        const scrolledAmount = Math.abs(currentScrollY - lastScrollY);

        if (navbar) {
            if (currentScrollY <= 60) { 
                navbar.classList.remove('scrolled', 'navbar-hidden');
            } else {
                navbar.classList.add('scrolled');
                if (scrolledAmount > SCROLL_THRESHOLD_NAVBAR) {
                    if (scrollDirection === 'down' && currentScrollY > navbar.offsetHeight + 50) { 
                        navbar.classList.add('navbar-hidden');
                    } else {
                        navbar.classList.remove('navbar-hidden');
                    }
                }
            }
        }
        
        if (progressBar) {
            const documentHeight = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            ) - window.innerHeight;
            const scrolledPercentage = documentHeight > 0 ? (window.pageYOffset / documentHeight) * 100 : 0;
            progressBar.style.width = `${Math.min(scrolledPercentage, 100)}%`; // Cap at 100%
        }
        
        if (scrollButton) {
            scrollButton.classList.toggle('visible', currentScrollY > 350); // Slightly higher threshold
        }

        if(sections.length > 0) changeNavActiveState();
        
        lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
    }, { passive: true });

    // --- Project Filtering ---
    const filterButtons = document.querySelectorAll('.projects-filter .filter-btn');
    const projectCards = document.querySelectorAll('.projects-grid .project-card');

    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.dataset.filter;

                projectCards.forEach(card => {
                    const cardCategory = card.dataset.category;
                    const matchesFilter = filterValue === 'all' || cardCategory === filterValue;
                    
                    if (matchesFilter) {
                        card.style.display = 'flex'; 
                        void card.offsetWidth; // Force reflow
                        card.classList.remove('hide');
                        // For simplified animation, .is-visible is added by observer.
                        // If cards are already observed, we might just ensure opacity/transform are correct.
                        // Or, if filtering re-triggers entry, observer handles it.
                        // For now, let's assume observer will pick them up or CSS handles initial state.
                        card.style.opacity = ''; // Let CSS handle visible state
                        card.style.transform = '';
                    } else {
                        card.classList.add('hide');
                        // Setting display to none after CSS transition completes
                        card.addEventListener('transitionend', function handleTransitionEnd() {
                            if (card.classList.contains('hide')) { // Double check
                               card.style.display = 'none';
                            }
                            card.removeEventListener('transitionend', handleTransitionEnd);
                        }, {once: true}); // Ensure listener is removed
                    }
                });
            });
        });
    }

    // --- Typewriter Effect ---
    function typeWriter(element, text, speed = 65, callback) { // Faster typing
        if (!element) return;
        
        let i = 0;
        let currentTextNode = element.firstChild && element.firstChild.nodeType === Node.TEXT_NODE ? element.firstChild : document.createTextNode('');
        if (!element.firstChild || element.firstChild.nodeType !== Node.TEXT_NODE) {
            element.insertBefore(currentTextNode, element.firstChild); // Ensure text node is first
        }
        
        let cursorSpan = element.querySelector('.typewriter-cursor');
        if (!cursorSpan) {
            cursorSpan = document.createElement('span');
            cursorSpan.className = 'typewriter-cursor';
            cursorSpan.innerHTML = '|';
            element.appendChild(cursorSpan);
        }
        currentTextNode.textContent = ''; // Clear only text node

        function type() {
            if (i < text.length) {
                currentTextNode.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                if (cursorSpan) cursorSpan.style.animationPlayState = 'paused'; 
                setTimeout(() => { 
                    if (cursorSpan) cursorSpan.style.animationPlayState = 'running';
                    if (callback) callback();
                }, 800); // Pause before callback
            }
        }
        if (cursorSpan) cursorSpan.style.animationPlayState = 'running';
        type();
    }
    
    if (typewriterElement) {
        const phrases = typewriterElement.dataset.phrases ? JSON.parse(typewriterElement.dataset.phrases) : [typewriterElement.textContent.trim() || "Innovative Developer"];
        let currentPhraseIndex = 0;
        typewriterElement.textContent = ''; // Clear static text

        function typeLoop() {
            typeWriter(typewriterElement, phrases[currentPhraseIndex], 65, () => {
                setTimeout(() => {
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                    typeLoop();
                }, 2200); // Wait before typing next phrase
            });
        }
        
        setTimeout(typeLoop, 800); // Initial delay
    }

    // --- Update Footer Year ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});