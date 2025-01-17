chrome.storage.sync.get({swapQualificationsProjectsTables: false}, (result) => {
    const tableSwapController = new ProjectsPageTablePositionController(result.swapQualificationsProjectsTables);
});


new ProjectHighlighter();
