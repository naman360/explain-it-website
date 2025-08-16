// Explain-It Background Service Worker
// Handles screenshot capture, storage, and extension lifecycle

class ExplainItBackground {
  constructor() {
    this.init();
  }

  init() {
    // Listen for messages from content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle keyboard shortcuts
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });

    // Handle extension icon click when no popup is available
    chrome.action.onClicked.addListener((tab) => {
      this.handleIconClick(tab);
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'takeScreenshot':
          const screenshot = await this.takeScreenshot();
          sendResponse({ success: true, dataUrl: screenshot });
          break;

        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, settings });
          break;

        case 'saveSettings':
          await this.saveSettings(message.settings);
          sendResponse({ success: true });
          break;

        case 'logUsage':
          await this.logUsage(message.data);
          sendResponse({ success: true });
          break;

        case 'checkPermissions':
          const hasPermissions = await this.checkPermissions();
          sendResponse({ success: true, hasPermissions });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleInstallation(details) {
    if (details.reason === 'install') {
      // First installation
      await this.initializeDefaultSettings();
      await this.showWelcomePage();
    } else if (details.reason === 'update') {
      // Extension update
      await this.handleUpdate(details.previousVersion);
    }
  }

  async handleCommand(command) {
    if (command === 'capture-screen') {
      // Get active tab and inject content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && this.isValidUrl(tab.url)) {
        try {
          // Inject content script if not already present
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/content.js']
          });

          // Send capture message
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'startCapture',
            source: 'keyboard'
          });
        } catch (error) {
          console.error('Failed to handle keyboard shortcut:', error);
          this.showNotification('Failed to start capture. Please try again from the extension popup.');
        }
      } else {
        this.showNotification('Explain-It cannot be used on this page. Try a different website.');
      }
    }
  }

  async handleIconClick(tab) {
    // This is called when the extension icon is clicked and popup is not available
    // Usually happens on restricted pages
    if (!this.isValidUrl(tab.url)) {
      this.showNotification('Explain-It cannot be used on this page. Try a different website.');
    }
  }

  async takeScreenshot() {
    try {
      // Capture visible tab
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: 'png',
        quality: 100
      });
      
      return dataUrl;
    } catch (error) {
      throw new Error('Failed to take screenshot: ' + error.message);
    }
  }

  async getSettings() {
    return await chrome.storage.sync.get([
      'openaiApiKey',
      'aiModel',
      'explanationStyle',
      'autoMode',
      'theme'
    ]);
  }

  async saveSettings(settings) {
    // Validate settings before saving
    if (settings.openaiApiKey && !settings.openaiApiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }

    await chrome.storage.sync.set({
      ...settings,
      lastUpdated: Date.now()
    });
  }

  async logUsage(data) {
    // Log usage statistics locally
    const stats = await chrome.storage.local.get([
      'totalExplanations',
      'dailyUsage',
      'monthlyUsage',
      'lastUsedDate'
    ]);

    const today = new Date().toDateString();
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const newStats = {
      totalExplanations: (stats.totalExplanations || 0) + 1,
      dailyUsage: {
        ...stats.dailyUsage,
        [today]: (stats.dailyUsage?.[today] || 0) + 1
      },
      monthlyUsage: {
        ...stats.monthlyUsage,
        [thisMonth]: (stats.monthlyUsage?.[thisMonth] || 0) + 1
      },
      lastUsedDate: today,
      lastUsageData: {
        timestamp: Date.now(),
        type: data.type || 'explanation',
        success: data.success || true,
        processingTime: data.processingTime || null
      }
    };

    await chrome.storage.local.set(newStats);
  }

  async checkPermissions() {
    try {
      const permissions = await chrome.permissions.getAll();
      const requiredPermissions = ['activeTab', 'storage'];
      
      return requiredPermissions.every(permission => 
        permissions.permissions.includes(permission)
      );
    } catch (error) {
      return false;
    }
  }

  async initializeDefaultSettings() {
    const defaultSettings = {
      aiModel: 'gpt-3.5-turbo',
      explanationStyle: 'simple',
      autoMode: false,
      theme: 'dark',
      firstInstall: Date.now(),
      version: chrome.runtime.getManifest().version
    };

    await chrome.storage.sync.set(defaultSettings);
    
    // Initialize stats
    await chrome.storage.local.set({
      totalExplanations: 0,
      dailyUsage: {},
      monthlyUsage: {},
      installDate: Date.now()
    });
  }

  async showWelcomePage() {
    // Open welcome/setup page
    await chrome.tabs.create({
      url: chrome.runtime.getURL('welcome/welcome.html')
    });
  }

  async handleUpdate(previousVersion) {
    // Handle extension updates
    const currentVersion = chrome.runtime.getManifest().version;
    
    // Perform migration if needed
    if (this.shouldMigrate(previousVersion, currentVersion)) {
      await this.migrateData(previousVersion);
    }

    // Update version in settings
    await chrome.storage.sync.set({
      version: currentVersion,
      lastUpdated: Date.now()
    });
  }

  shouldMigrate(fromVersion, toVersion) {
    // Check if migration is needed based on version numbers
    const from = fromVersion.split('.').map(Number);
    const to = toVersion.split('.').map(Number);
    
    // For now, migrate on any version change
    return fromVersion !== toVersion;
  }

  async migrateData(fromVersion) {
    // Perform data migration based on version
    console.log(`Migrating from version ${fromVersion}`);
    
    // Example migration logic
    if (fromVersion.startsWith('0.')) {
      // Migrate from beta to stable
      const oldSettings = await chrome.storage.local.get();
      if (oldSettings.apiKey) {
        await chrome.storage.sync.set({
          openaiApiKey: oldSettings.apiKey
        });
        await chrome.storage.local.remove(['apiKey']);
      }
    }
  }

  isValidUrl(url) {
    // Check if URL is valid for content script injection
    if (!url) return false;
    
    const invalidSchemes = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'edge://',
      'about:',
      'file://'
    ];

    return !invalidSchemes.some(scheme => url.startsWith(scheme));
  }

  showNotification(message, type = 'info') {
    // Show browser notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon-48.png',
      title: 'Explain-It',
      message: message
    });
  }

  // Context menu functionality (optional)
  async setupContextMenus() {
    chrome.contextMenus.create({
      id: 'explain-selection',
      title: 'Explain selected text',
      contexts: ['selection']
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === 'explain-selection' && info.selectionText) {
        try {
          // Inject content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/content.js']
          });

          // Send selected text for explanation
          await chrome.tabs.sendMessage(tab.id, {
            action: 'explainText',
            text: info.selectionText
          });
        } catch (error) {
          console.error('Context menu action failed:', error);
        }
      }
    });
  }

  // Analytics and monitoring
  async trackEvent(eventName, eventData = {}) {
    // Simple event tracking (you could integrate with analytics services)
    const event = {
      name: eventName,
      data: eventData,
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version
    };

    // Store locally (could be sent to analytics service in production)
    const events = await chrome.storage.local.get(['events']);
    const allEvents = events.events || [];
    allEvents.push(event);

    // Keep only last 1000 events
    if (allEvents.length > 1000) {
      allEvents.shift();
    }

    await chrome.storage.local.set({ events: allEvents });
  }

  // Error reporting
  async reportError(error, context = {}) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version,
      userAgent: navigator.userAgent
    };

    // Store error locally (could be sent to error reporting service)
    const errors = await chrome.storage.local.get(['errors']);
    const allErrors = errors.errors || [];
    allErrors.push(errorReport);

    // Keep only last 100 errors
    if (allErrors.length > 100) {
      allErrors.shift();
    }

    await chrome.storage.local.set({ errors: allErrors });
  }

  // Cleanup and maintenance
  async performMaintenance() {
    // Clean up old data periodically
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const stats = await chrome.storage.local.get(['dailyUsage']);
    if (stats.dailyUsage) {
      const cleanedDailyUsage = {};
      Object.entries(stats.dailyUsage).forEach(([date, count]) => {
        if (new Date(date).getTime() > oneMonthAgo) {
          cleanedDailyUsage[date] = count;
        }
      });
      
      await chrome.storage.local.set({ dailyUsage: cleanedDailyUsage });
    }
  }
}

// Initialize background script
const explainItBackground = new ExplainItBackground();

// Set up periodic maintenance
chrome.alarms.create('maintenance', { delayInMinutes: 1440 }); // Daily
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'maintenance') {
    explainItBackground.performMaintenance();
  }
});

// Global error handler
self.addEventListener('error', (event) => {
  explainItBackground.reportError(event.error, { type: 'uncaught_error' });
});

self.addEventListener('unhandledrejection', (event) => {
  explainItBackground.reportError(new Error(event.reason), { type: 'unhandled_promise' });
});
