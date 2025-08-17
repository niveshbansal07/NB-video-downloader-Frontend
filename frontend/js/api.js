/**
 * API communication module for video download service.
 * Handles all backend requests and responses.
 */

class VideoAPI {
    constructor() {
        // Update this URL to your Railway backend URL after deployment
        this.baseURL = 'https://nb-video-downloader-backend-production.up.railway.app/';
        
        // API endpoints
        this.endpoints = {
            preview: '/preview',
            download: '/download',
            health: '/health'
        };
    }

    /**
     * Set the backend URL (call this after deployment)
     * @param {string} url - The Railway backend URL
     */
    setBackendURL(url) {
        this.baseURL = url.replace(/\/$/, ''); // Remove trailing slash
    }

    /**
     * Make HTTP request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Response data
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
        };

        const requestOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);
            
            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            throw error;
        }
    }

    /**
     * Get video preview information
     * @param {string} url - YouTube video URL
     * @returns {Promise<Object>} Video information and available formats
     */
    async getVideoPreview(url) {
        const data = {
            url: url.trim()
        };

        return await this.makeRequest(this.endpoints.preview, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Download video with specified quality
     * @param {string} url - YouTube video URL
     * @param {string} quality - Selected quality
     * @param {string} formatId - Format ID (optional)
     * @returns {Promise<Object>} Download response
     */
    async downloadVideo(url, quality, formatId = null) {
        const data = {
            url: url.trim(),
            quality: quality,
            format_id: formatId
        };

        return await this.makeRequest(this.endpoints.download, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Check API health status
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        return await this.makeRequest(this.endpoints.health, {
            method: 'GET'
        });
    }

    /**
     * Get download URL for a file
     * @param {string} filename - Filename to download
     * @returns {string} Full download URL
     */
    getDownloadURL(filename) {
        return `${this.baseURL}/downloads/${encodeURIComponent(filename)}`;
    }

    /**
     * Validate YouTube URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid YouTube URL
     */
    validateYouTubeURL(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        const trimmedUrl = url.trim();
        
        // YouTube URL patterns
        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/youtu\.be\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/
        ];

        return patterns.some(pattern => pattern.test(trimmedUrl));
    }

    /**
     * Extract video ID from YouTube URL
     * @param {string} url - YouTube URL
     * @returns {string|null} Video ID or null if not found
     */
    extractVideoID(url) {
        if (!this.validateYouTubeURL(url)) {
            return null;
        }

        const trimmedUrl = url.trim();
        
        // Extract from youtube.com/watch?v= format
        const watchMatch = trimmedUrl.match(/[?&]v=([^&]+)/);
        if (watchMatch) {
            return watchMatch[1];
        }

        // Extract from youtu.be/ format
        const shortMatch = trimmedUrl.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) {
            return shortMatch[1];
        }

        // Extract from embed format
        const embedMatch = trimmedUrl.match(/embed\/([^?]+)/);
        if (embedMatch) {
            return embedMatch[1];
        }

        // Extract from v/ format
        const vMatch = trimmedUrl.match(/\/v\/([^?]+)/);
        if (vMatch) {
            return vMatch[1];
        }

        return null;
    }

    /**
     * Format number with appropriate suffix (K, M, B)
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Handle API errors and provide user-friendly messages
     * @param {Error} error - Error object
     * @returns {string} User-friendly error message
     */
    handleError(error) {
        const message = error.message || 'An unknown error occurred';
        
        // Common error patterns
        if (message.includes('timeout')) {
            return 'Request timed out. Please check your connection and try again.';
        }
        
        if (message.includes('fetch')) {
            return 'Unable to connect to the server. Please check your internet connection.';
        }
        
        if (message.includes('Invalid YouTube URL')) {
            return 'Please enter a valid YouTube video URL.';
        }
        
        if (message.includes('Video unavailable')) {
            return 'This video is not available for download. It may be private, deleted, or restricted.';
        }
        
        if (message.includes('Age restricted')) {
            return 'This video is age-restricted and cannot be downloaded.';
        }
        
        if (message.includes('Copyright')) {
            return 'This video is protected by copyright and cannot be downloaded.';
        }
        
        if (message.includes('HTTP 429')) {
            return 'Too many requests. Please wait a moment before trying again.';
        }
        
        if (message.includes('HTTP 500')) {
            return 'Server error. Please try again later.';
        }
        
        if (message.includes('HTTP 400')) {
            return 'Invalid request. Please check the video URL and try again.';
        }
        
        // Default error message
        return `Error: ${message}`;
    }
}

// Create global API instance
const videoAPI = new VideoAPI();

// Auto-detect backend URL in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // In production, try to detect the backend URL
    // You can update this logic based on your deployment setup
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Example: if frontend is on vercel.com, backend might be on railway.app
    // Update this according to your actual deployment
    if (hostname.includes('vercel.app')) {
        // Replace with your actual Railway backend URL
        videoAPI.setBackendURL('https://your-railway-backend.railway.app');
    }
}

// Export for use in other modules
window.videoAPI = videoAPI;

