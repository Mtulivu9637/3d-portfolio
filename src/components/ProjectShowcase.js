// Project Showcase Component

export class ProjectShowcase {
    constructor() {
        this.projects = {
            ios: [
                {
                    title: "E-commerce iOS App",
                    description: "Full-featured shopping app with Core Data, payment integration, and push notifications",
                    tech: ["Swift", "UIKit", "Core Data"],
                    category: "ios"
                },
                {
                    title: "Fitness Tracker App", 
                    description: "Health tracking app with HealthKit integration and workout analytics",
                    tech: ["SwiftUI", "HealthKit", "Charts"],
                    category: "ios"
                }
            ],
            backend: [
                {
                    title: "E-commerce API Backend",
                    description: "Scalable REST API with authentication, payment processing, and inventory management",
                    tech: ["Django", "DRF", "PostgreSQL"],
                    category: "backend"
                },
                {
                    title: "Content Management System",
                    description: "Full-featured CMS with user roles, content workflow, and media management", 
                    tech: ["Django", "Celery", "Redis"],
                    category: "backend"
                }
            ],
            frontend: [
                {
                    title: "React E-commerce Platform",
                    description: "Modern shopping platform with cart management, user authentication, and payment integration",
                    tech: ["React", "Redux", "Stripe"],
                    category: "frontend"
                },
                {
                    title: "Admin Dashboard",
                    description: "Comprehensive admin panel with real-time analytics and data visualization",
                    tech: ["React", "Chart.js", "WebSocket"],
                    category: "frontend"
                },
                {
                    title: "Marketplace Platform",
                    description: "Multi-vendor marketplace with seller dashboard and commission tracking",
                    tech: ["React", "Next.js", "GraphQL"],
                    category: "frontend"
                }
            ]
        };
        
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindFilterEvents();
        console.log('Project showcase initialized');
    }

    bindFilterEvents() {
        const filterBtns = document.querySelectorAll('.category-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterProjects(category);
            });
        });
    }

    filterProjects(category) {
        this.currentFilter = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Filter project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                anime({
                    targets: card,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 600,
                    easing: 'easeOutQuart'
                });
            } else {
                anime({
                    targets: card,
                    opacity: 0,
                    duration: 300,
                    complete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }

    animateEntry() {
        const projectCards = document.querySelectorAll('.project-card');
        anime({
            targets: projectCards,
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(200),
            duration: 800,
            easing: 'easeOutQuart'
        });
    }

    update(deltaTime) {
        // Update any 3D project elements
    }
}
