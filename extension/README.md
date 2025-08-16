# Explain-It Chrome Extension

🧠 **AI-powered instant explanations for any question on any website**

Perfect for students taking online tests, coding assessments, and studying from any web content.

## ✨ Features

- **1-Click Capture**: Select any question area with click & drag
- **Smart OCR**: Extract text from images using Tesseract.js
- **AI Explanations**: Get instant answers and step-by-step solutions via GPT
- **Slide-in Sidebar**: Clean interface with Answer/Steps/TL;DR tabs
- **Works Everywhere**: Exam portals, coding sites, PDFs, YouTube lectures
- **Dark Theme**: Sleek hacker aesthetic with neon accents

## 🚀 Installation

### Method 1: Load Unpacked (Development)

1. **Download the Extension**
   - Download or clone this repository
   - Locate the `extension/` folder

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `extension/` folder
   - The extension should appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Pin "Explain-It" for easy access

### Method 2: Install from Chrome Web Store
*Coming soon! Extension will be published to the Chrome Web Store.*

## ⚙️ Setup

1. **Get OpenAI API Key**
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure Extension**
   - Click the Explain-It icon in Chrome toolbar
   - Click "GPT Settings"
   - Paste your API key
   - Choose your preferred AI model and explanation style
   - Click "Save Settings"

## 🎯 How to Use

### Basic Usage
1. Navigate to any website with questions/content
2. Click the Explain-It extension icon
3. Click "Capture Question"
4. Click and drag to select the question area
5. Wait for AI analysis and explanation

### Keyboard Shortcut
- Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac) to start capture

### Sidebar Features
- **Answer Tab**: Direct answer to your question
- **Steps Tab**: Step-by-step solution breakdown
- **TL;DR Tab**: Quick summary and extracted text
- **Action Buttons**: Rephrase, simplify, or get more details

## 🌐 Supported Websites

The extension works on most websites including:
- **Exam Portals**: Canvas, Blackboard, Moodle, etc.
- **Coding Platforms**: LeetCode, HackerRank, CodeSignal
- **Learning Sites**: Khan Academy, Coursera, edX
- **Documentation**: MDN, Stack Overflow, GitHub
- **PDFs**: Any PDF viewed in browser
- **Video Platforms**: YouTube, Vimeo (for screenshot capture)

## 🔧 Technical Requirements

- **Chrome Version**: 88+ (Manifest V3 support)
- **OpenAI API Key**: Required for AI explanations
- **Internet Connection**: Required for OCR and AI processing
- **Permissions**: 
  - `activeTab`: To capture screenshots and inject content
  - `storage`: To save settings and usage stats

## 🛠️ Development

### File Structure
```
extension/
├── manifest.json          # Extension configuration
├── popup/                 # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Content script (injected into pages)
│   ├── content.css
│   └── content.js
├── background/            # Background service worker
│   └── background.js
├── libs/                  # Third-party libraries
│   └── tesseract.min.js   # OCR library
└── assets/                # Icons and images
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

### Key Technologies
- **Manifest V3**: Modern Chrome extension format
- **Tesseract.js**: Client-side OCR text extraction
- **OpenAI API**: GPT models for explanations
- **Chrome APIs**: Screenshots, storage, messaging
- **CSS3**: Dark theme with neon accents

### Building from Source
1. Clone the repository
2. Install dependencies: `npm install` (if using build tools)
3. Replace `libs/tesseract.min.js` with actual Tesseract.js library
4. Add extension icons to `assets/` folder
5. Load as unpacked extension in Chrome

## 🔒 Privacy & Security

- **Local Processing**: OCR happens locally in your browser
- **API Key Security**: Your OpenAI key is stored locally, never shared
- **No Data Collection**: No usage data is sent to our servers
- **Screenshot Privacy**: Screenshots are temporary and not stored
- **Open Source**: Full code transparency

## 🐛 Troubleshooting

### Common Issues

**"Extension not working on this page"**
- Some pages (chrome://, extension pages) block content scripts
- Try on a different website

**"API Error" or "No response from AI"**
- Check your OpenAI API key in settings
- Ensure you have API credits available
- Try a different AI model (GPT-3.5 is more reliable)

**"OCR failed" or poor text recognition**
- Ensure selected area contains clear, readable text
- Try selecting a smaller, more focused area
- Works best with high-contrast text

**Sidebar not appearing**
- Check if the page allows content script injection
- Try refreshing the page and using the extension again
- Disable other extensions that might conflict

### Performance Tips
- Use GPT-3.5 Turbo for faster responses
- Select smaller, focused areas for better OCR accuracy
- Close sidebar when done to free up memory

## 📞 Support

- **Issues**: Report bugs or request features on GitHub
- **Documentation**: Full guide at [project repository]
- **Community**: Join our Discord for help and tips

## 📄 License

MIT License - Feel free to modify and distribute

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Made with ❤️ for students who want to learn smarter, not harder.**
