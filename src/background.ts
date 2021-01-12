chrome.runtime.onInstalled.addListener(() => {
    chrome.webNavigation.onCompleted.addListener(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
        chrome.pageAction.show(id);
      });
    }, { 
        url: [
            { urlMatches: 'flipkart.com' },
            { urlMatches: 'amazon.in' }
        ]
    });
  });