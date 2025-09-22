// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const musicPlayer = document.getElementById('musicPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.querySelector('.progress-bar');
const progressFill = document.querySelector('.progress-fill');
const currentTimeEl = document.querySelector('.current-time');
const totalTimeEl = document.querySelector('.total-time');
const volumeSlider = document.querySelector('.volume-slider');
const openSettingsBtn = document.getElementById('openSettings');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettings');
const bassSlider = document.getElementById('bassSlider');
const bassValue = document.getElementById('bassValue');
const masterVolume = document.getElementById('masterVolume');
const masterValue = document.getElementById('masterValue');
const playerImage = document.getElementById('playerImage');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

// Music data
let currentTrack = 0;
let isPlaying = false;
let currentAudio = null;
let audioCtx = null;
let mediaSource = null;
let gainNode = null;
let bassFilter = null;
let userInteracted = false;
let tracks = [];
const albumArtByFolder = {
    'shoreline-mafia': 'https://tse2.mm.bing.net/th/id/OIP.lbTCfkx2FaUULmoZyUI_AQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
    'juice-wrld': 'https://www.billboard.com/wp-content/uploads/media/juice-wrld-2018-vmas-b-billboard-1548.jpg',
    'dave-blunts': 'https://images.genius.com/19c856df9f10d7c4e3d3b8c304c66402.1000x1000x1.png',
    'lil-uzi-vert': 'https://i.pinimg.com/736x/65/f0/ab/65f0ab0134d033a7f28d1c8d4c35ca27.jpg'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMusicPlayer();
    initializeFilters();
    initializeScrollAnimations();
    initializeSmoothScrolling();
    initializeUserInteraction();
    initializeSettings();
    scanAndBuildLibrary();
});

// Initialize user interaction tracking
function initializeUserInteraction() {
    // Mark user as interacted when they click anywhere on the page
    document.addEventListener('click', function() {
        if (!userInteracted) {
            userInteracted = true;
            console.log('User interaction detected - audio playback enabled');
        }
    }, { once: true });
}

// Navigation
function initializeNavigation() {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    });
}

// Music Player
function initializeMusicPlayer() {
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);

    // Progress bar
    progressBar.addEventListener('click', function(e) {
        if (currentAudio && currentAudio.duration) {
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const percentage = clickX / width;
            const newTime = percentage * currentAudio.duration;
            currentAudio.currentTime = newTime;
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', function() {
        if (gainNode) {
            gainNode.gain.value = this.value / 100;
        }
        if (masterVolume) {
            masterVolume.value = this.value;
            masterValue.textContent = `${this.value}%`;
        }
    });

    // Play music cards
    document.querySelectorAll('.play-btn, .play-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const musicCard = this.closest('.music-card, .artist-card');
            if (musicCard) {
                // Find the specific track by matching the card's title with track title
                const cardTitle = musicCard.querySelector('h4').textContent.trim();
                const trackIndex = tracks.findIndex(track => track.title === cardTitle);
                if (trackIndex !== -1) {
                    playTrack(trackIndex);
                } else {
                    // Fallback: if title doesn't match, try category (for artist cards)
                    const category = musicCard.getAttribute('data-category');
                    const fallbackTrackIndex = tracks.findIndex(track => track.category === category);
                    if (fallbackTrackIndex !== -1) {
                        playTrack(fallbackTrackIndex);
                    }
                }
            }
        });
    });

    // Auto-hide player when no track is selected
    if (tracks.length === 0) {
        musicPlayer.style.display = 'none';
    }
}

function playTrack(index) {
    if (index < 0 || index >= tracks.length) return;

    currentTrack = index;
    const track = tracks[currentTrack];

    // Update player UI
    playerImage.src = track.image;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;

    // Show player
    musicPlayer.classList.add('active');

    // Stop current audio if playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio = null;
    }

    // Create new audio element
    currentAudio = new Audio();
    currentAudio.preload = "metadata";
    
    // Set up audio event listeners
    currentAudio.addEventListener('loadedmetadata', function() {
        const duration = currentAudio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        totalTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    currentAudio.addEventListener('timeupdate', function() {
        if (currentAudio.duration) {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressFill.style.width = progress + '%';
            
            // Update current time
            const minutes = Math.floor(currentAudio.currentTime / 60);
            const seconds = Math.floor(currentAudio.currentTime % 60);
            currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    });

    currentAudio.addEventListener('ended', function() {
        playNext();
    });

    currentAudio.addEventListener('error', function(e) {
        console.error('Audio error:', e);
        console.error('Audio src:', track.audio);
        handleAudioError(e);
    });

    currentAudio.addEventListener('canplay', function() {
        console.log('Audio can play:', track.audio);
    });

    // Setup Web Audio pipeline
    setupAudioPipeline();

    // Set source and load
    currentAudio.src = track.audio;
    currentAudio.load();

    // Check if user has interacted before playing
    if (!userInteracted) {
        showAudioPermissionDialog(track);
    } else {
        playAudio();
    }
}

function showAudioPermissionDialog(track) {
    // Create a modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="
            background: #1a1a1a;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            border: 2px solid #ff6b6b;
        ">
            <div style="font-size: 3rem; color: #ff6b6b; margin-bottom: 1rem;">🎵</div>
            <h3 style="color: #fff; margin-bottom: 1rem; font-size: 1.5rem;">Ready to Play Music?</h3>
            <p style="color: #ccc; margin-bottom: 2rem; line-height: 1.6;">
                Click "Allow Audio" to start playing <strong>${track.title}</strong> by <strong>${track.artist}</strong>
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="allowAudio" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                ">Allow Audio</button>
                <button id="cancelAudio" style="
                    background: transparent;
                    color: #ccc;
                    border: 2px solid #333;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('allowAudio').addEventListener('click', function() {
        userInteracted = true;
        document.body.removeChild(modal);
        playAudio();
    });
    
    document.getElementById('cancelAudio').addEventListener('click', function() {
        document.body.removeChild(modal);
        // Reset player state
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
}

function playAudio() {
    if (!currentAudio) return;
    
    // Play the audio
    currentAudio.play().then(() => {
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        console.log('Playing:', tracks[currentTrack].title);
    }).catch(error => {
        console.error('Playback failed:', error);
        handleAudioError(error);
    });
}

function togglePlayPause() {
    if (!currentAudio) return;
    
    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        if (!userInteracted) {
            showAudioPermissionDialog(tracks[currentTrack]);
        } else {
            playAudio();
        }
    }
}

function playPrevious() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    playTrack(currentTrack);
}

function playNext() {
    currentTrack = (currentTrack + 1) % tracks.length;
    playTrack(currentTrack);
}

// Music Filters
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const musicCards = document.querySelectorAll('.music-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            musicCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Settings Modal
function initializeSettings() {
    if (!openSettingsBtn || !settingsModal) return;
    const open = () => settingsModal.classList.add('active');
    const close = () => settingsModal.classList.remove('active');
    openSettingsBtn.addEventListener('click', (e) => { e.preventDefault(); open(); });
    closeSettingsBtn.addEventListener('click', close);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) close(); });

    // Bass slider
    if (bassSlider) {
        bassSlider.addEventListener('input', function() {
            if (bassFilter) {
                bassFilter.gain.value = Number(this.value);
            }
            bassValue.textContent = `${this.value} dB`;
        });
    }

    // Master volume
    if (masterVolume) {
        masterVolume.addEventListener('input', function() {
            if (gainNode) {
                gainNode.gain.value = this.value / 100;
            }
            masterValue.textContent = `${this.value}%`;
            volumeSlider.value = this.value;
        });
    }
}

function setupAudioPipeline() {
    if (!currentAudio) return;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Disconnect previous chain
    if (mediaSource) try { mediaSource.disconnect(); } catch {}
    if (gainNode) try { gainNode.disconnect(); } catch {}
    if (bassFilter) try { bassFilter.disconnect(); } catch {}

    mediaSource = audioCtx.createMediaElementSource(currentAudio);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = (masterVolume ? masterVolume.value : volumeSlider.value) / 100;

    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 120; // Hz
    bassFilter.gain.value = bassSlider ? Number(bassSlider.value) : 0;

    mediaSource.connect(bassFilter);
    bassFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

// Auto-scan library via Electron preload
function scanAndBuildLibrary() {
    try {
        if (!window.leakedsongs || typeof window.leakedsongs.scanMusic !== 'function') {
            console.warn('Electron bridge not available; using existing hardcoded list');
            return;
        }
        const files = window.leakedsongs.scanMusic('./music');
        tracks = files.map(f => {
            const rel = f.relative.replace(/\\/g, '/');
            const parts = rel.split('/');
            const artistFolder = parts[1] || '';
            const filename = parts[2] || '';
            const title = filename.replace(/\.[^/.]+$/, '');
            return {
                title,
                artist: artistFolder.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                image: albumArtByFolder[artistFolder] || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
                audio: rel,
                category: artistFolder
            };
        });
        if (tracks.length > 0) {
            rebuildMusicGrid();
        }
    } catch (e) {
        console.error('Scan failed', e);
    }
}

function rebuildMusicGrid() {
    const grid = document.querySelector('.music-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (const track of tracks) {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.setAttribute('data-category', track.category);
        card.innerHTML = `
            <div class="music-image">
                <img src="${track.image}" alt="${track.title}">
                <div class="music-overlay">
                    <button class="play-btn"><i class="fas fa-play"></i></button>
                </div>
            </div>
            <div class="music-info">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
                <div class="music-meta"><span class="duration">-</span><span class="quality">HQ</span></div>
            </div>
        `;
        grid.appendChild(card);
    }
    // Rebind play buttons
    document.querySelectorAll('.play-btn').forEach((btn, idx) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.music-card');
            const title = card.querySelector('h4').textContent.trim();
            const i = tracks.findIndex(t => t.title === title);
            if (i !== -1) playTrack(i);
        });
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.artist-card, .music-card, .feature');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Artist Card Interactions
document.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', function() {
        const artist = this.getAttribute('data-artist');
        if (['shoreline-mafia', 'juice-wrld', 'dave-blunts', 'lil-uzi-vert'].includes(artist)) {
            // Scroll to music section and filter for the selected artist
            document.querySelector('#music').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                document.querySelector(`[data-filter="${artist}"]`).click();
            }, 500);
        }
    });
});

// Hero Button Actions
document.querySelectorAll('.hero-buttons .btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.textContent.includes('Explore Music')) {
            document.querySelector('#music').scrollIntoView({ behavior: 'smooth' });
        } else if (this.textContent.includes('View Artists')) {
            document.querySelector('#artists').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add loading states
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element, content) {
    element.innerHTML = content;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playPrevious();
    } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playNext();
    }
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Add ripple effect to all buttons
document.querySelectorAll('.btn, .play-btn, .control-btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Performance optimization: Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Add error handling for audio
function handleAudioError(error) {
    console.error('Audio error:', error);
    // Show user-friendly error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = 'Unable to play audio. Please try again.';
    errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 10000;
    `;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        errorMsg.remove();
    }, 3000);
}

// Add touch support for mobile
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// Add CSS for touch devices
const touchStyle = document.createElement('style');
touchStyle.textContent = `
    .touch-device .music-card:hover {
        transform: none;
    }
    
    .touch-device .artist-card:hover {
        transform: none;
    }
    
    .touch-device .music-card:active {
        transform: scale(0.98);
    }
    
    .touch-device .artist-card:active {
        transform: scale(0.98);
    }
`;
document.head.appendChild(touchStyle);
