// Popup functionality for Explain-It extension

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings and stats
  await loadSettings();
  await loadStats();
  
  // Event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Capture button
  const captureBtn = document.getElementById('capture-btn');
  captureBtn.addEventListener('click', startCapture);

  // Settings button
  const settingsBtn = document.getElementById('settings-btn');
  settingsBtn.addEventListener('click', openSettings);

  // Close settings
  const closeSettingsBtn = document.getElementById('close-settings');
  closeSettingsBtn.addEventListener('click', closeSettings);

  // Save settings
  const saveSettingsBtn = document.getElementById('save-settings');
  saveSettingsBtn.addEventListener('click', saveSettings);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

async function startCapture() {
  const captureBtn = document.getElementById('capture-btn');
  
  try {
    // Add loading state
    captureBtn.classList.add('active');
    captureBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
      <span>Click & Drag on Page</span>
    `;

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject content script if not already injected
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content.js']
    });

    // Send message to content script to start capture
    await chrome.tabs.sendMessage(tab.id, { 
      action: 'startCapture',
      timestamp: Date.now()
    });

    // Update stats
    await incrementStat('explanations-count');
    
    // Close popup
    window.close();
    
  } catch (error) {
    console.error('Capture failed:', error);
    showError('Failed to start capture. Please refresh the page and try again.');
    
    // Reset button
    captureBtn.classList.remove('active');
    captureBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 7v6h-6V7z"/>
        <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"/>
      </svg>
      <span>Capture Question</span>
    `;
  }
}

function openSettings() {
  const settingsPanel = document.getElementById('settings-panel');
  settingsPanel.classList.remove('hidden');
}

function closeSettings() {
  const settingsPanel = document.getElementById('settings-panel');
  settingsPanel.classList.add('hidden');
}

async function saveSettings() {
  const apiKey = document.getElementById('api-key').value;
  const model = document.getElementById('model-select').value;
  const style = document.getElementById('explanation-style').value;

  if (!apiKey.trim()) {
    showError('Please enter your OpenAI API key');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    showError('Invalid API key format. Should start with "sk-"');
    return;
  }

  try {
    // Save settings to Chrome storage
    await chrome.storage.sync.set({
      openaiApiKey: apiKey,
      aiModel: model,
      explanationStyle: style,
      lastUpdated: Date.now()
    });

    // Show success feedback
    const saveBtn = document.getElementById('save-settings');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = 'linear-gradient(45deg, #00ff88, #00cc66)';
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = 'linear-gradient(45deg, #00ffff, #0080ff)';
      closeSettings();
    }, 1500);

  } catch (error) {
    console.error('Failed to save settings:', error);
    showError('Failed to save settings. Please try again.');
  }
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'openaiApiKey',
      'aiModel',
      'explanationStyle'
    ]);

    // Populate form fields
    if (settings.openaiApiKey) {
      document.getElementById('api-key').value = settings.openaiApiKey;
    }
    
    if (settings.aiModel) {
      document.getElementById('model-select').value = settings.aiModel;
    }
    
    if (settings.explanationStyle) {
      document.getElementById('explanation-style').value = settings.explanationStyle;
    }

  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function loadStats() {
  try {
    const stats = await chrome.storage.local.get([
      'explanationsCount',
      'streakCount',
      'lastUsedDate'
    ]);

    // Update explanation count
    document.getElementById('explanations-count').textContent = 
      stats.explanationsCount || 0;

    // Calculate and update streak
    const today = new Date().toDateString();
    const lastUsed = stats.lastUsedDate;
    let streakCount = stats.streakCount || 0;

    if (lastUsed) {
      const lastUsedDate = new Date(lastUsed);
      const daysDiff = Math.floor((new Date() - lastUsedDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        streakCount = 0; // Streak broken
      } else if (daysDiff === 1) {
        // Streak continues, no increment here (increment when used)
      }
    }

    document.getElementById('streak-count').textContent = streakCount;

  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

async function incrementStat(statKey) {
  try {
    const stats = await chrome.storage.local.get([statKey, 'lastUsedDate', 'streakCount']);
    const today = new Date().toDateString();
    const lastUsed = stats.lastUsedDate;
    
    let newStats = {
      [statKey]: (stats[statKey] || 0) + 1,
      lastUsedDate: today
    };

    // Handle streak calculation
    if (statKey === 'explanations-count') {
      let streakCount = stats.streakCount || 0;
      
      if (lastUsed !== today) {
        const lastUsedDate = new Date(lastUsed || today);
        const daysDiff = Math.floor((new Date() - lastUsedDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          streakCount += 1; // Continue streak
        } else if (daysDiff === 0) {
          // Same day, don't change streak
        } else {
          streakCount = 1; // Reset streak
        }
      } else if (!lastUsed) {
        streakCount = 1; // First time
      }
      
      newStats.streakCount = streakCount;
    }

    await chrome.storage.local.set(newStats);
    
    // Update display
    document.getElementById(statKey.replace(/([A-Z])/g, '-$1').toLowerCase()).textContent = 
      newStats[statKey];
    
    if (newStats.streakCount !== undefined) {
      document.getElementById('streak-count').textContent = newStats.streakCount;
    }

  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

function handleKeyboardShortcuts(event) {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
    event.preventDefault();
    startCapture();
  }
}

function showError(message) {
  // Create a simple error notification
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(45deg, #ff6b6b, #ff5252);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
  `;
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 3000);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureComplete') {
    // Handle capture completion if needed
    console.log('Capture completed');
  } else if (message.action === 'captureError') {
    showError(message.error || 'Capture failed');
  }
});
