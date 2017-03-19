function initWebhooks() {
    restoreData(createContextMenuEntries);
    chrome.contextMenus.onClicked.addListener(sendCommand);
}

initWebhooks();