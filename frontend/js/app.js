/**
 * Main application logic for video download service.
 * Handles user interactions, video preview, quality selection, and download functionality.
 */

class VideoDownloadApp {
    constructor() {
        this.currentVideoInfo = null;
        this.selectedQuality = null;
        this.selectedFormatId = null;
        
        // DOM elements
        this.elements = {
            videoUrl: document.getElementById('videoUrl'),
            previewBtn: document.getElementById('previewBtn'),
            loadingSection: document.getElementById('loadingSection'),
            previewSection: document.getElementById('previewSection'),
            errorSection: document.getElementById('errorSection'),
            successSection: document.getElementById('successSection'),
            downloadSection: document.getElementById('downloadSection'),
            qualityButtons: document.getElementById('qualityButtons'),
            downloadBtn: document.getElementById('downloadBtn'),
            retryBtn: document.getElementById('retryBtn'),
            downloadLink: document.getElementById('downloadLink'),
            videoThumbnail: document.getElementById('videoThumbnail'),
            videoTitle: document.getElementById('videoTitle'),
            videoUploader: document.getElementById('videoUploader'),
            videoDuration: document.getElementById('videoDuration'),
            videoViews: document.getElementById('videoViews'),
            videoLikes: document.getElementById('videoLikes'),
            selectedQualitySpan: document.getElementById('selectedQuality'),
            fileSizeSpan: document.getElementById('fileSize'),
            errorMessage: document.getElementById('errorMessage')
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.setupExampleButtons();
        this.addHoverEffects();
        
        // Check API health on load
        this.checkAPIHealth();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Preview button click
        this.elements.previewBtn.addEventListener('click', () => {
            this.handlePreviewClick();
        });

        // Enter key in URL input
        this.elements.videoUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handlePreviewClick();
            }
        });

        // Download button click
        this.elements.downloadBtn.addEventListener('click', () => {
            this.handleDownloadClick();
        });

        // Retry button click
        this.elements.retryBtn.addEventListener('click', () => {
            this.handleRetryClick();
        });

        // URL input focus for better UX
        this.elements.videoUrl.addEventListener('focus', () => {
            this.elements.videoUrl.select();
        });

        // Quality button clicks (delegated)
        this.elements.qualityButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('quality-btn')) {
                this.handleQualitySelection(e.target);
            }
        });
    }

    /**
     * Setup example URL buttons
     */
    setupExampleButtons() {
        const exampleButtons = document.querySelectorAll('.example-btn');
        exampleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const url = button.dataset.url;
                this.elements.videoUrl.value = url;
                this.handlePreviewClick();
            });
        });
    }

    /**
     * Add hover effects to interactive elements
     */
    addHoverEffects() {
        // Add hover effects to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            animationManager.addHoverEffect(button, 'lift');
        });

        // Add hover effects to quality buttons
        const qualityButtons = document.querySelectorAll('.quality-btn');
        qualityButtons.forEach(button => {
            animationManager.addHoverEffect(button, 'scale');
        });
    }

    /**
     * Check API health status
     */
    async checkAPIHealth() {
        try {
            await videoAPI.checkHealth();
            console.log('API is healthy');
        } catch (error) {
            console.warn('API health check failed:', error.message);
        }
    }

    /**
     * Handle preview button click
     */
    async handlePreviewClick() {
        const url = this.elements.videoUrl.value.trim();
        
        if (!url) {
            this.showError('Please enter a YouTube video URL');
            return;
        }

        if (!videoAPI.validateYouTubeURL(url)) {
            this.showError('Please enter a valid YouTube video URL');
            return;
        }

        await this.getVideoPreview(url);
    }

    /**
     * Get video preview information
     * @param {string} url - YouTube video URL
     */
    async getVideoPreview(url) {
        try {
            this.showLoading();
            
            const videoInfo = await videoAPI.getVideoPreview(url);
            this.currentVideoInfo = videoInfo;
            
            this.displayVideoPreview(videoInfo);
            this.showPreview();
            
        } catch (error) {
            const errorMessage = videoAPI.handleError(error);
            this.showError(errorMessage);
        }
    }

    /**
     * Display video preview information
     * @param {Object} videoInfo - Video information from API
     */
    displayVideoPreview(videoInfo) {
        // Update video details
        this.elements.videoThumbnail.src = videoInfo.thumbnail;
        this.elements.videoThumbnail.alt = videoInfo.title;
        this.elements.videoTitle.textContent = videoInfo.title;
        this.elements.videoUploader.textContent = `By ${videoInfo.uploader}`;
        this.elements.videoDuration.textContent = videoInfo.duration_formatted;
        this.elements.videoViews.textContent = `${videoAPI.formatNumber(videoInfo.view_count)} views`;
        this.elements.videoLikes.textContent = `${videoAPI.formatNumber(videoInfo.like_count)} likes`;

        // Generate quality buttons
        this.generateQualityButtons(videoInfo.formats);
    }

    /**
     * Generate quality selection buttons
     * @param {Array} formats - Available video formats
     */
    generateQualityButtons(formats) {
        this.elements.qualityButtons.innerHTML = '';

        formats.forEach((format, index) => {
            const button = document.createElement('button');
            button.className = 'quality-btn';
            button.dataset.quality = format.quality;
            button.dataset.formatId = format.format_id;
            button.dataset.filesize = format.filesize_formatted;
            
            button.innerHTML = `
                <span class="quality-label">${format.quality}</span>
                <span class="quality-details">${format.filesize_formatted}</span>
            `;

            // Add animation delay for staggered appearance
            button.style.animationDelay = `${index * 50}ms`;
            button.classList.add('fade-in');

            this.elements.qualityButtons.appendChild(button);
        });

        // Auto-select highest quality
        const firstButton = this.elements.qualityButtons.querySelector('.quality-btn');
        if (firstButton) {
            this.handleQualitySelection(firstButton);
        }
    }

    /**
     * Handle quality button selection
     * @param {HTMLElement} button - Selected quality button
     */
    handleQualitySelection(button) {
        // Remove selection from all buttons
        const allButtons = this.elements.qualityButtons.querySelectorAll('.quality-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('selected');
        });

        // Select clicked button
        button.classList.add('selected');
        animationManager.animateQualitySelection(button, true);

        // Update selected quality
        this.selectedQuality = button.dataset.quality;
        this.selectedFormatId = button.dataset.formatId;

        // Update download section
        this.updateDownloadSection();
        this.showDownloadSection();
    }

    /**
     * Update download section with selected quality info
     */
    updateDownloadSection() {
        const selectedButton = this.elements.qualityButtons.querySelector('.quality-btn.selected');
        if (selectedButton) {
            this.elements.selectedQualitySpan.textContent = `Quality: ${selectedButton.dataset.quality}`;
            this.elements.fileSizeSpan.textContent = `Size: ${selectedButton.dataset.filesize}`;
        }
    }

    /**
     * Handle download button click
     */
    async handleDownloadClick() {
        if (!this.currentVideoInfo || !this.selectedQuality) {
            this.showError('Please select a video quality first');
            return;
        }

        await this.downloadVideo();
    }

    /**
     * Download video with selected quality
     */
    async downloadVideo() {
        try {
            // Add loading state to download button
            const originalText = this.elements.downloadBtn.innerHTML;
            animationManager.addLoadingState(this.elements.downloadBtn, originalText);

            const response = await videoAPI.downloadVideo(
                this.elements.videoUrl.value,
                this.selectedQuality,
                this.selectedFormatId
            );

            if (response.success) {
                this.showSuccess(response);
            } else {
                this.showError(response.message || 'Download failed');
            }

        } catch (error) {
            const errorMessage = videoAPI.handleError(error);
            this.showError(errorMessage);
        } finally {
            // Remove loading state
            animationManager.removeLoadingState(this.elements.downloadBtn);
        }
    }

    /**
     * Handle retry button click
     */
    handleRetryClick() {
        this.hideError();
        this.showUrlSection();
    }

    /**
     * Show loading section
     */
    showLoading() {
        this.hideAllSections();
        this.elements.loadingSection.classList.remove('hidden');
        animationManager.fadeIn(this.elements.loadingSection);
    }

    /**
     * Show preview section
     */
    showPreview() {
        this.hideAllSections();
        this.elements.previewSection.classList.remove('hidden');
        animationManager.fadeIn(this.elements.previewSection);
    }

    /**
     * Show download section
     */
    showDownloadSection() {
        this.elements.downloadSection.classList.remove('hidden');
        animationManager.slideUp(this.elements.downloadSection);
    }

    /**
     * Show error section
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.hideAllSections();
        this.elements.errorMessage.textContent = message;
        this.elements.errorSection.classList.remove('hidden');
        animationManager.fadeIn(this.elements.errorSection);
        animationManager.shake(this.elements.errorSection);
    }

    /**
     * Show success section
     * @param {Object} response - Download response
     */
    showSuccess(response) {
        this.hideAllSections();
        
        // Set download link
        const downloadURL = videoAPI.getDownloadURL(response.filename);
        this.elements.downloadLink.href = downloadURL;
        this.elements.downloadLink.download = response.filename;
        
        this.elements.successSection.classList.remove('hidden');
        animationManager.fadeIn(this.elements.successSection);
        animationManager.bounce(this.elements.successSection);
    }

    /**
     * Show URL input section
     */
    showUrlSection() {
        this.hideAllSections();
        // URL section is always visible, just ensure others are hidden
    }

    /**
     * Hide error section
     */
    hideError() {
        this.elements.errorSection.classList.add('hidden');
    }

    /**
     * Hide all sections except URL input
     */
    hideAllSections() {
        this.elements.loadingSection.classList.add('hidden');
        this.elements.previewSection.classList.add('hidden');
        this.elements.errorSection.classList.add('hidden');
        this.elements.successSection.classList.add('hidden');
        this.elements.downloadSection.classList.add('hidden');
    }

    /**
     * Reset the application state
     */
    reset() {
        this.currentVideoInfo = null;
        this.selectedQuality = null;
        this.selectedFormatId = null;
        
        this.elements.videoUrl.value = '';
        this.hideAllSections();
    }

    /**
     * Handle clipboard paste events
     */
    handlePaste() {
        navigator.clipboard.readText().then(text => {
            if (videoAPI.validateYouTubeURL(text)) {
                this.elements.videoUrl.value = text;
                this.handlePreviewClick();
            }
        }).catch(() => {
            // Clipboard access denied or not supported
        });
    }

    /**
     * Add keyboard shortcuts
     */
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + V to paste and preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                setTimeout(() => {
                    this.handlePaste();
                }, 100);
            }
            
            // Escape to reset
            if (e.key === 'Escape') {
                this.reset();
            }
        });
    }

    /**
     * Add mobile-specific features
     */
    addMobileFeatures() {
        // Add touch feedback
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = '';
            });
        });

        // Auto-focus URL input on mobile
        if ('ontouchstart' in window) {
            this.elements.videoUrl.focus();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new VideoDownloadApp();
    
    // Add additional features
    app.addKeyboardShortcuts();
    app.addMobileFeatures();
    
    // Make app globally accessible for debugging
    window.videoDownloadApp = app;
    
    console.log('Video Download App initialized successfully');
});

// Add service worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
