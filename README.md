<<<<<<< HEAD
Leakso RELEASES
=======
# LeakedSongs - Professional Music Website

A modern, responsive website for showcasing leaked music from famous artists with beautiful animations and professional design.

## Features

- 🎵 **Music Player**: Custom-built music player with play/pause, skip, and volume controls
- 🎨 **Modern Design**: Beautiful gradient backgrounds and smooth animations
- 📱 **Responsive**: Fully responsive design that works on all devices
- 🎭 **Artist Profiles**: Dedicated sections for different artists (currently featuring Shoreline Mafia)
- 🎪 **Interactive Elements**: Hover effects, smooth scrolling, and engaging animations
- 🎯 **Music Gallery**: Filterable music collection with high-quality previews
- ⚡ **Performance**: Optimized for fast loading and smooth performance

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript**: Interactive functionality and animations
- **Font Awesome**: Icons for enhanced UI
- **Google Fonts**: Inter font family for typography

## Project Structure

```
Leakedsongsweb/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
├── music/              # Audio files directory
│   ├── shoreline-mafia/ # Shoreline Mafia tracks
│   └── README.md       # Music directory guide
└── README.md           # Project documentation
```

## Getting Started

1. **Clone or download** this repository
2. **Add your music files** to the `music/shoreline-mafia/` directory
3. **Update the tracks array** in `script.js` with your actual audio file paths
4. **Open `index.html`** in your web browser

## Adding Music Files

1. Place your audio files in the `music/shoreline-mafia/` folder
2. Update the `tracks` array in `script.js`:

```javascript
let tracks = [
    {
        title: "Your Track Title",
        artist: "Shoreline Mafia",
        image: "path/to/cover-image.jpg",
        audio: "music/shoreline-mafia/your-track.mp3"
    }
];
```

## Customization

### Colors
The main color scheme can be customized by modifying the CSS variables in `styles.css`:
- Primary color: `#ff6b6b` (red/pink)
- Background: `#0a0a0a` (dark)
- Text: `#fff` (white)

### Adding New Artists
1. Add a new artist card in the HTML
2. Create a new folder in the `music/` directory
3. Update the JavaScript to handle the new artist

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Features in Detail

### Navigation
- Fixed header with smooth scrolling
- Mobile-responsive hamburger menu
- Active link highlighting

### Hero Section
- Animated gradient background
- Floating geometric shapes
- Call-to-action buttons
- Scroll indicator

### Music Player
- Custom controls (play/pause, skip, volume)
- Progress bar with click-to-seek
- Track information display
- Keyboard shortcuts (spacebar, arrow keys)

### Artist Cards
- Hover animations
- Play button overlay
- Artist statistics
- Responsive grid layout

### Music Gallery
- Filterable by artist/category
- Hover effects and animations
- Quality indicators
- Duration display

## Performance Optimizations

- Lazy loading for images
- Smooth animations with CSS transforms
- Efficient event handling
- Mobile-optimized touch interactions

## Legal Notice

Please ensure you have the proper rights to use any audio files you add to this website. This template is for educational and personal use only.

## License

This project is open source and available under the MIT License.

---

**Created with ❤️ for music lovers**
>>>>>>> b787c50 (Initial commit)
