// ===========================
// SIMBA AI ACADEMY - MAIN JAVASCRIPT
// ===========================

// Global variables
let allModalTriggers = [];
let allModals = [];
let isInitialized = false;

// ===========================
// HAMBURGER MENU FUNCTIONALITY
// ===========================

// Initialize hamburger menu
function initializeHamburger() {
    console.log('Initializing hamburger menu...');
    
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    console.log('Hamburger element:', hamburger);
    console.log('Nav links element:', navLinks);
    
    if (hamburger && navLinks) {
        console.log('Adding hamburger event listeners...');
        
        hamburger.addEventListener('click', function(e) {
            console.log('Hamburger clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu state
            hamburger.setAttribute('aria-expanded', !isExpanded);
            
            // Use classList toggle for better CSS control
            navLinks.classList.toggle('show');
            body.classList.toggle('menu-open');
            
            // Update hamburger icon
            hamburger.textContent = isExpanded ? '☰' : '✕';
            
            console.log('Menu toggled. Expanded:', !isExpanded);
            console.log('Nav links classes:', navLinks.className);
            console.log('Nav links display style:', navLinks.style.display);
        });
        
        // Close menu when clicking on a link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Nav link clicked, closing menu...');
                navLinks.classList.remove('show');
                body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.textContent = '☰';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('show');
                body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.textContent = '☰';
            }
        });
        
        console.log('Hamburger menu initialized successfully!');
    } else {
        console.error('Hamburger or nav-links elements not found!');
    }
}

// ===========================
// MODAL FUNCTIONALITY
// ===========================

// Function to open any modal
function openModal(modal, trigger) {
    if (!modal || !trigger) {
        console.error('Modal or trigger not found');
        return;
    }
    
    console.log('Opening modal:', modal.id);
    
    // Store the trigger element for focus restoration
    modal.dataset.previousFocus = trigger;
    
    // Show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';
    
    // Focus trap
    setupFocusTrap(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
        firstFocusable.focus();
    }
    
    // Track modal open
    if (window.simbaMetrics) {
        window.simbaMetrics.track('modal-open', { 
            type: modal.classList.contains('ai-modal') ? 'ai-course' : 'year-program',
            course: modal.id 
        });
    }
}

// Function to close any modal
function closeModal(modal) {
    if (!modal) return;
    
    console.log('Closing modal:', modal.id);
    
    // Hide modal
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    
    // Remove focus trap
    removeFocusTrap(modal);
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Restore focus to trigger element
    const previousFocus = modal.dataset.previousFocus;
    if (previousFocus && typeof previousFocus === 'object' && previousFocus.focus) {
        try {
            previousFocus.focus();
        } catch (error) {
            console.log('Could not restore focus to previous element:', error);
        }
        delete modal.dataset.previousFocus;
    }
    
    // Track modal close
    if (window.simbaMetrics) {
        window.simbaMetrics.track('modal-close', { 
            type: modal.classList.contains('ai-modal') ? 'ai-course' : 'year-program',
            course: modal.id 
        });
    }
}

// Enhanced focus trap function
function setupFocusTrap(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Create a unique handler function for this modal
    const handleTabKey = function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };
    
    // Store the handler function reference
    modal.dataset.focusTrapHandler = handleTabKey;
    
    // Add the event listener
    modal.addEventListener('keydown', handleTabKey);
}

// Remove focus trap
function removeFocusTrap(modal) {
    const handler = modal.dataset.focusTrapHandler;
    if (handler && typeof handler === 'function') {
        modal.removeEventListener('keydown', handler);
        delete modal.dataset.focusTrapHandler;
    }
}

// Event handler functions
function handleModalClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const modalId = this.getAttribute('data-modal-target');
    console.log('Modal trigger clicked:', modalId);
    
    // Remove the # from the ID if present
    const cleanModalId = modalId.replace('#', '');
    const modal = document.getElementById(cleanModalId);
    
    console.log('Looking for modal with ID:', cleanModalId, 'Found:', !!modal);
    
    if (modal) {
        openModal(modal, this);
    } else {
        console.error('Modal not found:', cleanModalId);
        // Try to find the modal again with a small delay
        setTimeout(() => {
            const retryModal = document.getElementById(cleanModalId);
            if (retryModal) {
                console.log('Modal found on retry, opening now');
                openModal(retryModal, this);
            } else {
                console.error('Modal still not found after retry:', cleanModalId);
            }
        }, 100);
    }
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeModal(e.currentTarget);
    }
}

// Handle close button clicks
function handleCloseClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button clicked');
    
    const modal = e.target.closest('.modal');
    if (modal) {
        console.log('Closing modal:', modal.id);
        closeModal(modal);
    } else {
        console.log('No modal found for close button');
    }
}

// Handle overlay clicks
function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
        const modal = e.target.closest('.modal');
        if (modal) {
            console.log('Overlay clicked, closing modal:', modal.id);
            closeModal(modal);
        }
    }
}

// Handle CTA clicks in modals
function handleCTAClicks(e) {
    if (e.target.matches('[data-action="book-call"], .year-program-cta--primary, .ai-cta--primary')) {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
            closeModal(modal);
        }
        smoothScrollToContact();
    } else if (e.target.matches('[data-action="apply"], .year-program-cta--secondary, .ai-cta--secondary')) {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
            closeModal(modal);
        }
        smoothScrollToContact();
    }
}

// ===========================
// SMOOTH SCROLLING
// ===========================

// Enhanced smooth scroll to contact with offset calculation
function smoothScrollToContact() {
    const contactSection = document.getElementById('contact');
    if (!contactSection) {
        console.error('Contact section not found');
        return;
    }
    
    // Calculate header offset
    const header = document.querySelector('.main-nav');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Calculate target position
    const targetPosition = contactSection.offsetTop - headerHeight - 20;
    
    // Smooth scroll
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    // Track scroll action
    if (window.simbaMetrics) {
        window.simbaMetrics.track('scroll-to-contact', { source: 'modal-cta' });
    }
    
    console.log('Scrolling to contact section');
}

// ===========================
// MODAL INITIALIZATION
// ===========================

// Initialize all modal functionality
function initializeModals() {
    if (isInitialized) {
        console.log('Modals already initialized, skipping...');
        return;
    }
    
    console.log('Initializing modals...');
    
    // Get fresh references to elements
    allModalTriggers = document.querySelectorAll('.view-more');
    allModals = document.querySelectorAll('.modal');
    
    console.log('Found modal triggers:', allModalTriggers.length);
    console.log('Found modals:', allModals.length);
    
    if (allModalTriggers.length === 0) {
        console.log('No modal triggers found, will retry later');
        return;
    }
    
    if (allModals.length === 0) {
        console.log('No modals found, will retry later');
        return;
    }
    
    // Log all modal triggers
    allModalTriggers.forEach((trigger, index) => {
        console.log(`Trigger ${index}:`, trigger.textContent, 'Target:', trigger.getAttribute('data-modal-target'));
    });
    
    // Log all modals
    allModals.forEach((modal, index) => {
        console.log(`Modal ${index}:`, modal.id, 'Classes:', modal.className);
    });
    
    // Add click handlers to all modal triggers
    allModalTriggers.forEach(trigger => {
        // Remove any existing event listeners
        trigger.removeEventListener('click', handleModalClick);
        // Add new event listener
        trigger.addEventListener('click', handleModalClick);
    });
    
    // Add close functionality to all modals
    allModals.forEach(modal => {
        // Close button - look for all possible close button classes
        const closeBtn = modal.querySelector('.modal__close, .ai-modal__close, .spa-modal-close, [data-close]');
        if (closeBtn) {
            console.log('Found close button for modal:', modal.id, 'Button:', closeBtn.className);
            closeBtn.removeEventListener('click', handleCloseClick);
            closeBtn.addEventListener('click', handleCloseClick);
        } else {
            console.log('No close button found for modal:', modal.id);
        }
        
        // Overlay click
        const overlay = modal.querySelector('.modal__overlay, .ai-modal__overlay');
        if (overlay) {
            console.log('Found overlay for modal:', modal.id);
            overlay.removeEventListener('click', handleOverlayClick);
            overlay.addEventListener('click', handleOverlayClick);
        } else {
            console.log('No overlay found for modal:', modal.id);
        }
        
        // Escape key
        modal.removeEventListener('keydown', handleEscapeKey);
        modal.addEventListener('keydown', handleEscapeKey);
    });
    
    // Handle CTA clicks in modals
    document.removeEventListener('click', handleCTAClicks);
    document.addEventListener('click', handleCTAClicks);
    
    isInitialized = true;
    console.log('Modal initialization complete!');
}

// ===========================
// DOM READY HANDLING
// ===========================

// Function to wait for DOM and initialize
function waitForDOM() {
    console.log('Waiting for DOM...');
    
    // Check if DOM is already loaded
    if (document.readyState === 'complete') {
        console.log('DOM already complete, initializing immediately');
        setTimeout(initializeModals, 100);
    } else if (document.readyState === 'interactive') {
        console.log('DOM interactive, waiting a bit more');
        setTimeout(initializeModals, 200);
    } else {
        console.log('DOM still loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired, initializing modals');
            // Add a delay to ensure all elements are parsed and existing JS has run
            setTimeout(initializeModals, 500);
        });
    }
}

// Also listen for window load as a backup
window.addEventListener('load', () => {
    console.log('Window load event fired, checking if modals need initialization');
    if (!isInitialized || allModalTriggers.length === 0 || allModals.length === 0) {
        console.log('Re-initializing modals on window load');
        setTimeout(initializeModals, 200);
    }
});

// ===========================
// ANALYTICS
// ===========================

// Enhanced analytics for new modals
function enhanceAnalytics() {
    // Track modal interactions
    document.addEventListener('click', (e) => {
        if (e.target.matches('.ai-cta, .year-program-cta')) {
            const action = e.target.getAttribute('data-action') || 'cta-click';
            const modal = e.target.closest('.modal');
            if (modal) {
                const courseType = modal.classList.contains('ai-modal') ? 'ai-course' : 'year-program';
                
                if (window.simbaMetrics) {
                    window.simbaMetrics.track(action, {
                        course: modal.id,
                        type: courseType,
                        cta: e.target.textContent.trim()
                    });
                }
            }
        }
    });
    
    // Track course card interactions
    document.addEventListener('click', (e) => {
        if (e.target.matches('.prog-card, .ai-card')) {
            const course = e.target.dataset.course;
            if (window.simbaMetrics) {
                window.simbaMetrics.track('course-card-click', { course });
            }
        }
    });
}

// ===========================
// INITIALIZATION
// ===========================

// Initialize everything
waitForDOM();
enhanceAnalytics();

console.log('🎓 Simba AI Academy - Enhanced Programs Section Loaded!');
console.log('📚 3-Year Program cards with rich modals');
console.log('🤖 AI & Emerging Tech Courses with detailed information');
console.log('🔗 All CTAs wired to smooth scroll and mailto links');

// ===========================
// CURRICULUM SECTION FUNCTIONALITY
// ===========================

// Initialize curriculum functionality
function initializeCurriculum() {
    console.log('Initializing curriculum functionality...');
    
    // Level selection
    const levelCards = document.querySelectorAll('.level-card');
    const moduleCards = document.querySelectorAll('.module-card');
    const curriculumPanel = document.querySelector('.curriculum-panel');
    
    if (!levelCards.length || !moduleCards.length) {
        console.log('Curriculum elements not found, skipping initialization');
        return;
    }
    
    // Level selection functionality
    levelCards.forEach(card => {
        card.addEventListener('click', () => {
            const level = card.dataset.level;
            console.log('Level selected:', level);
            
            // Update active level
            levelCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Show corresponding module
            moduleCards.forEach(module => {
                if (module.dataset.level === level) {
                    module.classList.add('active');
                    updateCurriculumPanel(module);
                } else {
                    module.classList.remove('active');
                }
            });
        });
    });
    
    // Module expand functionality
    moduleCards.forEach(card => {
        const expandBtn = card.querySelector('.module-expand');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                console.log('Module expand clicked, current state:', isExpanded ? 'expanded' : 'collapsed');
                
                if (isExpanded) {
                    card.classList.remove('expanded');
                    expandBtn.classList.remove('expanded');
                } else {
                    card.classList.add('expanded');
                    expandBtn.classList.add('expanded');
                }
            });
        }
    });
    
    // Initialize with first level active
    if (levelCards.length > 0) {
        levelCards[0].click();
    }
    
    console.log('Curriculum functionality initialized successfully!');
}

// Update curriculum panel content
function updateCurriculumPanel(moduleCard) {
    const panel = document.querySelector('.curriculum-panel');
    if (!panel) return;
    
    const moduleTitle = moduleCard.querySelector('.module-title')?.textContent || 'Module';
    const moduleDuration = moduleCard.querySelector('.module-duration')?.textContent || '3 Months';
    
    // Update panel duration
    const panelDuration = panel.querySelector('.panel-duration');
    if (panelDuration) {
        panelDuration.textContent = moduleDuration;
    }
    
    // Update panel title
    const panelTitle = panel.querySelector('.panel-title');
    if (panelTitle) {
        panelTitle.textContent = moduleTitle;
    }
    
    // Update panel content based on module level
    const level = moduleCard.dataset.level;
    const panelContent = panel.querySelector('.panel-list');
    
    if (panelContent) {
        let content = '';
        
        switch (level) {
            case '1':
                content = `
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Target:</strong> Beginners (Grades 9–12)
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Eligibility:</strong> No prior coding required
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Learn:</strong> HTML, CSS, basic JavaScript
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Outcome:</strong> Build simple, responsive websites
                        </div>
                    </li>
                `;
                break;
            case '2':
                content = `
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Target:</strong> Students with web basics
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Eligibility:</strong> Completion of Level 1 or prior knowledge of HTML/CSS
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Learn:</strong> JavaScript logic, APIs, databases, Node.js basics
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Outcome:</strong> Develop interactive and dynamic web apps
                        </div>
                    </li>
                `;
                break;
            case '3':
                content = `
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Target:</strong> Advanced learners aiming for career skills
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Eligibility:</strong> Completion of Level 2 or equivalent coding background
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Learn:</strong> React/Next.js, backend integration, AI coding assistants, deployment
                        </div>
                    </li>
                    <li class="panel-item">
                        <span class="panel-bullet">•</span>
                        <div class="panel-item-content">
                            <strong>Outcome:</strong> Become a career-ready full-stack developer with portfolio projects
                        </div>
                    </li>
                `;
                break;
        }
        
        panelContent.innerHTML = content;
    }
    
    // Update next link
    const nextLink = panel.querySelector('.next-link');
    if (nextLink) {
        let nextText = '';
        switch (level) {
            case '1':
                nextText = 'Read Next: Module 2 - Dynamic Web Development';
                break;
            case '2':
                nextText = 'Read Next: Module 3 - Full-Stack Development with AI Tools';
                break;
            case '3':
                nextText = 'Read Next: Module 1 - Foundations of Web Development';
                break;
        }
        nextLink.textContent = nextText;
    }
}

// Initialize curriculum when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeCurriculum, 100);
    initializeHamburger();
});

// Also initialize on window load as backup
window.addEventListener('load', () => {
    if (!document.querySelector('.curriculum-section-new')) {
        setTimeout(initializeCurriculum, 200);
    }
    initializeHamburger();
});
  
  