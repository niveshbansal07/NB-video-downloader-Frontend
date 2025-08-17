/**
 * Animation utilities for smooth CSS transitions and effects.
 * Provides consistent animation functions across the application.
 */

class AnimationManager {
    constructor() {
        this.animationDuration = 300; // Default animation duration in ms
        this.easingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)'; // Material Design easing
    }

    /**
     * Show element with fade-in animation
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - CSS easing function
     */
    fadeIn(element, duration = this.animationDuration, easing = this.easingFunction) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
        
        // Force reflow
        element.offsetHeight;
        
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Clean up after animation
        setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
        }, duration);
    }

    /**
     * Hide element with fade-out animation
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - CSS easing function
     * @returns {Promise} Promise that resolves when animation completes
     */
    fadeOut(element, duration = this.animationDuration, easing = this.easingFunction) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
            element.style.opacity = '0';
            element.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Slide element in from bottom
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - CSS easing function
     */
    slideUp(element, duration = this.animationDuration, easing = this.easingFunction) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
        
        // Force reflow
        element.offsetHeight;
        
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Clean up after animation
        setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
        }, duration);
    }

    /**
     * Scale element in with bounce effect
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     */
    scaleIn(element, duration = this.animationDuration) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = `opacity ${duration}ms ${this.easingFunction}, transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        
        // Force reflow
        element.offsetHeight;
        
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
        
        // Clean up after animation
        setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
        }, duration);
    }

    /**
     * Add loading spinner animation to button
     * @param {HTMLElement} button - Button element
     * @param {string} originalText - Original button text
     */
    addLoadingState(button, originalText) {
        if (!button) return;

        button.disabled = true;
        button.dataset.originalText = originalText;
        
        const spinner = document.createElement('div');
        spinner.className = 'button-spinner';
        spinner.innerHTML = `
            <div class="spinner-ring"></div>
        `;
        
        button.innerHTML = '';
        button.appendChild(spinner);
        
        // Add CSS for spinner if not already present
        this.addSpinnerStyles();
    }

    /**
     * Remove loading spinner from button
     * @param {HTMLElement} button - Button element
     */
    removeLoadingState(button) {
        if (!button) return;

        button.disabled = false;
        const originalText = button.dataset.originalText || 'Button';
        
        button.innerHTML = originalText;
        delete button.dataset.originalText;
    }

    /**
     * Add spinner CSS styles to document
     */
    addSpinnerStyles() {
        if (document.getElementById('spinner-styles')) return;

        const style = document.createElement('style');
        style.id = 'spinner-styles';
        style.textContent = `
            .button-spinner {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .spinner-ring {
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: buttonSpin 1s linear infinite;
            }
            
            @keyframes buttonSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Pulse animation for attention
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     */
    pulse(element, duration = 600) {
        if (!element) return;

        element.style.animation = `pulse ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Shake animation for error feedback
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     */
    shake(element, duration = 500) {
        if (!element) return;

        element.style.animation = `shake ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Bounce animation for success feedback
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     */
    bounce(element, duration = 600) {
        if (!element) return;

        element.style.animation = `bounce ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Add CSS keyframes for animations
     */
    addAnimationKeyframes() {
        if (document.getElementById('animation-keyframes')) return;

        const style = document.createElement('style');
        style.id = 'animation-keyframes';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
                40%, 43% { transform: translate3d(0,-8px,0); }
                70% { transform: translate3d(0,-4px,0); }
                90% { transform: translate3d(0,-2px,0); }
            }
            
            @keyframes slideInFromRight {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInFromLeft {
                from {
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes zoomIn {
                from {
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% {
                    opacity: 1;
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Animate quality button selection
     * @param {HTMLElement} button - Quality button element
     * @param {boolean} isSelected - Whether button is being selected
     */
    animateQualitySelection(button, isSelected) {
        if (!button) return;

        if (isSelected) {
            this.scaleIn(button, 200);
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    }

    /**
     * Animate section transitions
     * @param {HTMLElement} oldSection - Section to hide
     * @param {HTMLElement} newSection - Section to show
     * @param {number} duration - Animation duration in ms
     */
    async transitionSections(oldSection, newSection, duration = this.animationDuration) {
        if (oldSection) {
            await this.fadeOut(oldSection, duration);
        }
        
        if (newSection) {
            newSection.style.display = 'block';
            this.fadeIn(newSection, duration);
        }
    }

    /**
     * Animate progress bar
     * @param {HTMLElement} progressBar - Progress bar element
     * @param {number} progress - Progress percentage (0-100)
     * @param {number} duration - Animation duration in ms
     */
    animateProgress(progressBar, progress, duration = 1000) {
        if (!progressBar) return;

        progressBar.style.transition = `width ${duration}ms ${this.easingFunction}`;
        progressBar.style.width = `${progress}%`;
        
        setTimeout(() => {
            progressBar.style.transition = '';
        }, duration);
    }

    /**
     * Add hover effects to elements
     * @param {HTMLElement} element - Element to add hover effects to
     * @param {string} effect - Effect type ('lift', 'glow', 'scale')
     */
    addHoverEffect(element, effect = 'lift') {
        if (!element) return;

        const effects = {
            lift: `
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            `,
            glow: `
                transition: box-shadow 0.2s ease;
            `,
            scale: `
                transition: transform 0.2s ease;
            `
        };

        element.style.cssText += effects[effect] || effects.lift;

        element.addEventListener('mouseenter', () => {
            switch (effect) {
                case 'lift':
                    element.style.transform = 'translateY(-2px)';
                    element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    break;
                case 'glow':
                    element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
                    break;
                case 'scale':
                    element.style.transform = 'scale(1.02)';
                    break;
            }
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
            element.style.boxShadow = '';
        });
    }

    /**
     * Initialize all animations
     */
    init() {
        this.addAnimationKeyframes();
        this.addSpinnerStyles();
    }
}

// Create global animation manager instance
const animationManager = new AnimationManager();

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animationManager.init();
});

// Export for use in other modules
window.animationManager = animationManager;
