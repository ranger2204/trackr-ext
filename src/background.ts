chrome.runtime.onInstalled.addListener(() => {
    chrome.webNavigation.onCompleted.addListener((details) => {
      // In Manifest V3, action is always visible by default
      // We can enable/disable it based on the URL
      if (details.frameId === 0) { // Only for main frame
        chrome.action.enable(details.tabId);
      }
    }, {
        url: [
            { urlMatches: 'flipkart.com' },
            { urlMatches: 'amazon.in' }
        ]
    });
  });