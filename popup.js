document.addEventListener('DOMContentLoaded', function() {
  const tabsList = document.getElementById('tabsList');
  
  // Get all tabs and create the list
  chrome.tabs.query({}, function(tabs) {
    // First, get the list of enabled tabs from the background script
    chrome.runtime.sendMessage({ action: 'getEnabledTabs' }, function(response) {
      const enabledTabs = new Set(response.enabledTabs);
      
      tabs.forEach(tab => {
        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';
        
        const title = document.createElement('div');
        title.className = 'tab-title';
        title.textContent = tab.title;
        
        const switchContainer = document.createElement('label');
        switchContainer.className = 'switch';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = enabledTabs.has(tab.id);
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        switchContainer.appendChild(checkbox);
        switchContainer.appendChild(slider);
        
        tabItem.appendChild(title);
        tabItem.appendChild(switchContainer);
        tabsList.appendChild(tabItem);
        
        // Add event listener for the switch
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
}); 