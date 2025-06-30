// Navigation Component with Smooth Transitions

export class Navigation {
    constructor() {
        this.activeSection = 'hero';
        this.navItems = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupSmoothScrolling();
        console.log('Navigation initialized');
    }

    bindEvents() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            this.navItems.push(link);
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
        
        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close mobile menu when clicking on a link
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    handleNavClick(event) {
        event.preventDefault();
        const href = event.target.getAttribute('href');
        const targetSection = href.substring(1); // Remove #
        this.navigateToSection(targetSection);
    }

    navigateToSection(sectionName) {
        const element = document.getElementById(sectionName);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.setActiveSection(sectionName);
        }
    }

    setActiveSection(sectionName) {
        this.activeSection = sectionName;
        this.updateActiveNavItem();
    }

    updateActiveNavItem() {
        this.navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === `#${this.activeSection}`) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    setupSmoothScrolling() {
        // Additional smooth scrolling enhancements
        document.documentElement.style.scrollBehavior = 'smooth';
    }
}
