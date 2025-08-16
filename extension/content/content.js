// Explain-It Content Script
// Handles screenshot capture, OCR, AI explanations, and sidebar display

class ExplainItContentScript {
  constructor() {
    this.isCapturing = false;
    this.selectionOverlay = null;
    this.selectionBox = null;
    this.startX = 0;
    this.startY = 0;
    this.sidebar = null;
    this.currentExplanation = null;
    
    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'startCapture') {
        this.startCapture();
        sendResponse({ success: true });
      }
    });

    // Load Tesseract.js if not already loaded
    this.loadTesseract();
  }

  async loadTesseract() {
    if (window.Tesseract) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('libs/tesseract.min.js');
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  startCapture() {
    if (this.isCapturing) return;
    
    this.isCapturing = true;
    this.createSelectionOverlay();
    this.addEventListeners();
  }

  createSelectionOverlay() {
    // Remove existing overlay if any
    if (this.selectionOverlay) {
      this.selectionOverlay.remove();
    }

    // Create overlay
    this.selectionOverlay = document.createElement('div');
    this.selectionOverlay.className = 'explain-it-selection-overlay';
    
    // Create hint
    const hint = document.createElement('div');
    hint.className = 'explain-it-selection-hint';
    hint.innerHTML = `
      <div class="hint-title">🎯 Select Question Area</div>
      <div class="hint-subtitle">Click and drag to capture the question you need help with</div>
    `;
    
    this.selectionOverlay.appendChild(hint);
    document.body.appendChild(this.selectionOverlay);

    // Create selection box
    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'explain-it-selection-box';
    this.selectionBox.style.display = 'none';
    this.selectionOverlay.appendChild(this.selectionBox);
  }

  addEventListeners() {
    // Mouse events for selection
    this.selectionOverlay.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Escape key to cancel
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  onMouseDown(e) {
    if (e.target.className === 'explain-it-selection-hint') return;
    
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    this.selectionBox.style.left = this.startX + 'px';
    this.selectionBox.style.top = this.startY + 'px';
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';
    this.selectionBox.style.display = 'block';
    
    // Hide hint
    const hint = this.selectionOverlay.querySelector('.explain-it-selection-hint');
    if (hint) hint.style.display = 'none';
  }

  onMouseMove(e) {
    if (!this.isCapturing || !this.selectionBox.style.display === 'block') return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);

    this.selectionBox.style.left = left + 'px';
    this.selectionBox.style.top = top + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';
  }

  async onMouseUp(e) {
    if (!this.isCapturing || !this.selectionBox.style.display === 'block') return;

    const rect = this.selectionBox.getBoundingClientRect();
    
    // Check if selection is large enough
    if (rect.width < 10 || rect.height < 10) {
      this.cancelCapture();
      return;
    }

    // Capture the selected area
    await this.captureSelectedArea(rect);
  }

  onKeyDown(e) {
    if (e.key === 'Escape' && this.isCapturing) {
      this.cancelCapture();
    }
  }

  cancelCapture() {
    this.isCapturing = false;
    
    if (this.selectionOverlay) {
      this.selectionOverlay.remove();
      this.selectionOverlay = null;
    }
    
    this.removeEventListeners();
  }

  removeEventListeners() {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  async captureSelectedArea(rect) {
    try {
      // Show loading state
      this.showSidebar();
      this.setSidebarContent('loading');
      
      // Take screenshot using Chrome API
      const screenshot = await this.takeScreenshot();
      
      // Extract the selected area from screenshot
      const croppedImage = await this.cropImage(screenshot, rect);
      
      // Perform OCR
      const extractedText = await this.performOCR(croppedImage);
      
      // Get AI explanation
      const explanation = await this.getAIExplanation(extractedText);
      
      // Display results
      this.displayExplanation(explanation, extractedText);
      
      // Clean up
      this.cancelCapture();
      
    } catch (error) {
      console.error('Capture failed:', error);
      this.setSidebarContent('error', error.message);
      this.cancelCapture();
    }
  }

  async takeScreenshot() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'takeScreenshot' },
        (response) => {
          if (response && response.dataUrl) {
            resolve(response.dataUrl);
          } else {
            reject(new Error('Failed to take screenshot'));
          }
        }
      );
    });
  }

  async cropImage(dataUrl, rect) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate device pixel ratio for high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.drawImage(
          img,
          rect.left * dpr,
          rect.top * dpr,
          rect.width * dpr,
          rect.height * dpr,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = dataUrl;
    });
  }

  async performOCR(imageDataUrl) {
    try {
      if (!window.Tesseract) {
        await this.loadTesseract();
      }

      const { data: { text } } = await Tesseract.recognize(
        imageDataUrl,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              this.updateLoadingProgress(m.progress);
            }
          }
        }
      );

      return text.trim();
    } catch (error) {
      throw new Error('OCR failed: ' + error.message);
    }
  }

  async getAIExplanation(text) {
    // Get settings
    const settings = await chrome.storage.sync.get([
      'openaiApiKey',
      'aiModel',
      'explanationStyle'
    ]);

    if (!settings.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please set it in the extension popup.');
    }

    const model = settings.aiModel || 'gpt-3.5-turbo';
    const style = settings.explanationStyle || 'simple';

    const stylePrompts = {
      simple: 'Explain this in the simplest way possible, like you\'re talking to a student.',
      detailed: 'Provide a comprehensive and detailed explanation.',
      'step-by-step': 'Break this down into clear, numbered steps.',
      beginner: 'Explain this assuming the person is a complete beginner.'
    };

    const prompt = `You are an AI tutor helping a student understand a question. ${stylePrompts[style]}

Please analyze this question and provide:
1. A clear, direct answer
2. Step-by-step explanation of how to solve it
3. Key concepts involved

Question: ${text}

Format your response in JSON with these fields:
{
  "answer": "Direct answer to the question",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "concepts": ["Concept 1", "Concept 2"],
  "tldr": "One sentence summary"
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI tutor. Always respond with valid JSON as requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error?.message || 'Request failed'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from AI');
      }

      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        return {
          answer: content,
          steps: ['See the main answer for detailed explanation'],
          concepts: ['Various concepts covered in the explanation'],
          tldr: 'AI provided a detailed explanation'
        };
      }

    } catch (error) {
      throw new Error(`AI request failed: ${error.message}`);
    }
  }

  showSidebar() {
    if (this.sidebar) return;

    this.sidebar = document.createElement('div');
    this.sidebar.className = 'explain-it-sidebar';
    this.sidebar.innerHTML = `
      <div class="explain-it-sidebar-header">
        <div class="explain-it-sidebar-title">
          <div class="explain-it-sidebar-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
              <path d="M3.5 9.88a8 8 0 1 0 14.12 0"/>
              <path d="M12 2v6"/>
            </svg>
          </div>
          Explain-It
        </div>
        <button class="explain-it-close-btn">×</button>
      </div>
      
      <div class="explain-it-tabs">
        <button class="explain-it-tab active" data-tab="answer">Answer</button>
        <button class="explain-it-tab" data-tab="steps">Steps</button>
        <button class="explain-it-tab" data-tab="tldr">TL;DR</button>
      </div>
      
      <div class="explain-it-content">
        <div id="explain-it-content-container">
          <!-- Content will be loaded here -->
        </div>
      </div>
      
      <div class="explain-it-actions">
        <button class="explain-it-action-btn" data-action="rephrase">Rephrase</button>
        <button class="explain-it-action-btn" data-action="simpler">Make Simpler</button>
        <button class="explain-it-action-btn" data-action="detailed">More Details</button>
      </div>
    `;

    document.body.appendChild(this.sidebar);

    // Add event listeners
    this.sidebar.querySelector('.explain-it-close-btn').addEventListener('click', () => {
      this.hideSidebar();
    });

    // Tab switching
    this.sidebar.querySelectorAll('.explain-it-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Action buttons
    this.sidebar.querySelectorAll('.explain-it-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleAction(e.target.dataset.action);
      });
    });

    // Show sidebar with animation
    setTimeout(() => {
      this.sidebar.classList.add('show');
    }, 10);
  }

  hideSidebar() {
    if (!this.sidebar) return;

    this.sidebar.classList.remove('show');
    setTimeout(() => {
      if (this.sidebar) {
        this.sidebar.remove();
        this.sidebar = null;
      }
    }, 300);
  }

  setSidebarContent(type, data = null) {
    if (!this.sidebar) return;

    const container = this.sidebar.querySelector('#explain-it-content-container');
    
    switch (type) {
      case 'loading':
        container.innerHTML = `
          <div class="explain-it-loading">
            <div class="explain-it-loading-spinner"></div>
            <div class="explain-it-loading-text">Analyzing question...</div>
          </div>
        `;
        break;
        
      case 'error':
        container.innerHTML = `
          <div class="explain-it-error">
            <div class="explain-it-error-icon">⚠️</div>
            <div class="explain-it-error-title">Something went wrong</div>
            <div class="explain-it-error-message">${data || 'Please try again'}</div>
            <button class="explain-it-retry-btn" onclick="window.explainItContentScript.startCapture()">
              Try Again
            </button>
          </div>
        `;
        break;
    }
  }

  updateLoadingProgress(progress) {
    const loadingText = this.sidebar?.querySelector('.explain-it-loading-text');
    if (loadingText) {
      const percentage = Math.round(progress * 100);
      loadingText.textContent = `Extracting text... ${percentage}%`;
    }
  }

  displayExplanation(explanation, originalText) {
    if (!this.sidebar) return;

    this.currentExplanation = explanation;
    const container = this.sidebar.querySelector('#explain-it-content-container');

    container.innerHTML = `
      <div class="explain-it-tab-content active" id="tab-answer">
        <div class="explain-it-answer-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Answer
          </h3>
          <p>${this.formatText(explanation.answer)}</p>
        </div>
      </div>

      <div class="explain-it-tab-content" id="tab-steps">
        <div class="explain-it-answer-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Step-by-Step Solution
          </h3>
          <ol>
            ${explanation.steps.map(step => `<li>${this.formatText(step)}</li>`).join('')}
          </ol>
        </div>
        
        ${explanation.concepts && explanation.concepts.length > 0 ? `
        <div class="explain-it-answer-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Key Concepts
          </h3>
          <ul>
            ${explanation.concepts.map(concept => `<li>${this.formatText(concept)}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>

      <div class="explain-it-tab-content" id="tab-tldr">
        <div class="explain-it-answer-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Quick Summary
          </h3>
          <p style="font-size: 16px; font-weight: 500; color: #00ffff;">
            ${this.formatText(explanation.tldr)}
          </p>
        </div>
        
        <div class="explain-it-answer-section">
          <h3>Extracted Text</h3>
          <pre style="font-size: 12px; max-height: 200px; overflow-y: auto;">${originalText}</pre>
        </div>
      </div>
    `;
  }

  formatText(text) {
    // Basic formatting for better readability
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  switchTab(tabName) {
    if (!this.sidebar) return;

    // Update tab buttons
    this.sidebar.querySelectorAll('.explain-it-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    this.sidebar.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    this.sidebar.querySelectorAll('.explain-it-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    this.sidebar.querySelector(`#tab-${tabName}`).classList.add('active');
  }

  async handleAction(action) {
    if (!this.currentExplanation) return;

    const btn = this.sidebar.querySelector(`[data-action="${action}"]`);
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
      let prompt = '';
      switch (action) {
        case 'rephrase':
          prompt = 'Rephrase this explanation in different words while keeping the same meaning:';
          break;
        case 'simpler':
          prompt = 'Make this explanation much simpler and easier to understand:';
          break;
        case 'detailed':
          prompt = 'Provide a more detailed and comprehensive explanation:';
          break;
      }

      const settings = await chrome.storage.sync.get(['openaiApiKey', 'aiModel']);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: settings.aiModel || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\n${this.currentExplanation.answer}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const newAnswer = data.choices[0]?.message?.content;

      if (newAnswer) {
        this.currentExplanation.answer = newAnswer;
        this.updateAnswerTab(newAnswer);
      }

    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      btn.disabled = false;
      btn.textContent = btn.dataset.action === 'rephrase' ? 'Rephrase' : 
                       btn.dataset.action === 'simpler' ? 'Make Simpler' : 'More Details';
    }
  }

  updateAnswerTab(newAnswer) {
    const answerSection = this.sidebar.querySelector('#tab-answer .explain-it-answer-section p');
    if (answerSection) {
      answerSection.innerHTML = this.formatText(newAnswer);
    }
  }
}

// Initialize content script
if (!window.explainItContentScript) {
  window.explainItContentScript = new ExplainItContentScript();
}
