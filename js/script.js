// ===========================
// SIMBA AI ACADEMY - MAIN JAVASCRIPT
// ===========================

// Global variables
let allModalTriggers = [];
let allModals = [];
let isInitialized = false;

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
  
  