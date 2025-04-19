// Store the tabs that should be auto-reloaded
let autoReloadTabs = new Set();

// Function to get a random time between 1 and 10 minutes (in milliseconds)
function getRandomTime() {
  return Math.floor(Math.random() * (10 - 1 + 1) + 1) * 60 * 1000;
}

// Function to reload a specific tab
function reloadTab(tabId) {
  chrome.tabs.reload(tabId);
}

// Function to schedule the next reload for a tab
function scheduleNextReload(tabId) {
  const delay = getRandomTime();
  setTimeout(() => {
    if (autoReloadTabs.has(tabId)) {
      reloadTab(tabId);
      scheduleNextReload(tabId);
    }
  }, delay);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleTab') {
    const tabId = message.tabId;
    if (message.enabled) {
      autoReloadTabs.add(tabId);
      scheduleNextReload(tabId);
    } else {
      autoReloadTabs.delete(tabId);
    }
    sendResponse({ success: true });
  } else if (message.action === 'getEnabledTabs') {
    sendResponse({ enabledTabs: Array.from(autoReloadTabs) });
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  autoReloadTabs.delete(tabId);
}); 