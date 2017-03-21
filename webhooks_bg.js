function initWebhooks() {
    restoreData(createContextMenuEntries);
    chrome.contextMenus.onClicked.addListener(sendCommand);
    browser.browserAction.onClicked.addListener(openOptionsPage)
}

initWebhooks();