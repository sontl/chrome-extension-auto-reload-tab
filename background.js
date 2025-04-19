// Store the tabs that should be auto-reloaded
let autoReloadTabs = new Map();

// Function to get a random time between 30 seconds and 2 minutes (in milliseconds)
function getRandomTime() {
  return Math.floor(Math.random() * (120 - 30 + 1) + 30) * 1000;
}

// Function to check if a tab is a noVNC connection
async function isNoVNCTab(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Check for noVNC specific elements or scripts
        return !!document.querySelector('canvas.vnc-canvas') || 
               !!document.querySelector('div.noVNC_canvas') ||
               document.title.includes('noVNC');
      }
    });
    return results[0].result;
  } catch (error) {
    console.error('Error checking noVNC tab:', error);
    return false;
  }
}

// Function to reload a specific tab
async function reloadTab(tabId) {
  try {
    // First, check if it's still a noVNC tab
    const isNoVNC = await isNoVNCTab(tabId);
    if (!isNoVNC) {
      console.log('Tab is no longer a noVNC connection, removing from auto-reload');
      autoReloadTabs.delete(tabId);
      await saveEnabledTabs();
      return;
    }

    // Give noVNC time to properly disconnect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload the tab
    await chrome.tabs.reload(tabId);
    
    // Wait for the page to load
    await new Promise(resolve => {
      chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info) {
        if (updatedTabId === tabId && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });
    
    // Verify it's still a noVNC tab after reload
    const stillNoVNC = await isNoVNCTab(tabId);
    if (!stillNoVNC) {
      console.log('Tab is no longer a noVNC connection after reload');
      autoReloadTabs.delete(tabId);
      await saveEnabledTabs();
      return;
    }
    
    // Schedule next reload
    scheduleNextReload(tabId);
  } catch (error) {
    console.error('Error reloading tab:', error);
  }
}

// Function to schedule the next reload for a tab
function scheduleNextReload(tabId) {
  const delay = getRandomTime();
  const nextReloadTime = Date.now() + delay;
  
  autoReloadTabs.set(tabId, {
    nextReloadTime: nextReloadTime,
    interval: delay
  });

  setTimeout(() => {
    if (autoReloadTabs.has(tabId)) {
      reloadTab(tabId);
    }
  }, delay);
}

// Save enabled tabs to storage
async function saveEnabledTabs() {
  const tabsToSave = {};
  autoReloadTabs.forEach((info, tabId) => {
    tabsToSave[tabId] = {
      nextReloadTime: info.nextReloadTime,
      interval: info.interval
    };
  });
  await chrome.storage.local.set({ enabledTabs: tabsToSave });
}

// Load enabled tabs from storage
async function loadEnabledTabs() {
  const result = await chrome.storage.local.get('enabledTabs');
  const savedTabs = result.enabledTabs || {};
  
  // Check each saved tab and re-enable if it's still a noVNC tab
  for (const [tabId, info] of Object.entries(savedTabs)) {
    const numericTabId = parseInt(tabId);
    try {
      const tab = await chrome.tabs.get(numericTabId);
      if (tab) {
        const isNoVNC = await isNoVNCTab(numericTabId);
        if (isNoVNC) {
          autoReloadTabs.set(numericTabId, info);
          scheduleNextReload(numericTabId);
        }
      }
    } catch (error) {
      console.log('Tab no longer exists:', tabId);
    }
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleTab') {
    const tabId = message.tabId;
    if (message.enabled) {
      // Verify it's a noVNC tab before enabling
      isNoVNCTab(tabId).then(async isNoVNC => {
        if (isNoVNC) {
          scheduleNextReload(tabId);
          await saveEnabledTabs();
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Not a noVNC tab' });
        }
      });
      return true; // Required for async response
    } else {
      autoReloadTabs.delete(tabId);
      saveEnabledTabs();
      sendResponse({ success: true });
    }
  } else if (message.action === 'getEnabledTabs') {
    const tabsInfo = {};
    autoReloadTabs.forEach((info, tabId) => {
      tabsInfo[tabId] = {
        nextReloadTime: info.nextReloadTime,
        interval: info.interval
      };
    });
    sendResponse({ enabledTabs: tabsInfo });
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener(async (tabId) => {
  autoReloadTabs.delete(tabId);
  await saveEnabledTabs();
});

// Initialize when extension starts
chrome.runtime.onStartup.addListener(loadEnabledTabs);
chrome.runtime.onInstalled.addListener(loadEnabledTabs);

// Load enabled tabs when background script starts
loadEnabledTabs(); 