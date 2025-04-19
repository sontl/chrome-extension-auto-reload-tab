document.addEventListener('DOMContentLoaded', function() {
  const tabsList = document.getElementById('tabsList');
  let updateInterval;
  
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${seconds} seconds`;
  }
  
  function updateTimerDisplay(tabId, timerElement, nextReloadTime) {
    const now = Date.now();
    const timeLeft = nextReloadTime - now;
    if (timeLeft > 0) {
      timerElement.textContent = `Next refresh in: ${formatTime(timeLeft)}`;
    } else {
      timerElement.textContent = 'Refreshing...';
    }
  }
  
  function createTabElement(tab) {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.id = `tab-${tab.id}`;
    
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-info';
    
    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title;
    
    const timer = document.createElement('div');
    timer.className = 'tab-timer';
    
    tabInfo.appendChild(title);
    tabInfo.appendChild(timer);
    
    const switchContainer = document.createElement('label');
    switchContainer.className = 'switch';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    
    switchContainer.appendChild(checkbox);
    switchContainer.appendChild(slider);
    
    tabItem.appendChild(tabInfo);
    tabItem.appendChild(switchContainer);
    tabsList.appendChild(tabItem);
    
    return { tabItem, timer, checkbox };
  }
  
  function updateTabsList() {
    chrome.tabs.query({}, function(tabs) {
      chrome.runtime.sendMessage({ action: 'getEnabledTabs' }, function(response) {
        const enabledTabs = response.enabledTabs || {};
        
        // Clear existing tabs
        tabsList.innerHTML = '';
        
        tabs.forEach(tab => {
          const { tabItem, timer, checkbox } = createTabElement(tab);
          
          const isEnabled = enabledTabs[tab.id] !== undefined;
          checkbox.checked = isEnabled;
          
          if (isEnabled) {
            updateTimerDisplay(tab.id, timer, enabledTabs[tab.id].nextReloadTime);
          } else {
            timer.textContent = 'Auto-refresh disabled';
          }
          
          checkbox.addEventListener('change', function() {
            chrome.runtime.sendMessage({
              action: 'toggleTab',
              tabId: tab.id,
              enabled: this.checked
            });
          });
        });
      });
    });
  }
  
  // Initial update
  updateTabsList();
  
  // Update every second
  updateInterval = setInterval(updateTabsList, 1000);
  
  // Clean up interval when popup closes
  window.addEventListener('unload', function() {
    clearInterval(updateInterval);
  });
}); 