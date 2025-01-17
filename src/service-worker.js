
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    chrome.tabs.sendMessage(tab.id, request);
  })();
});

