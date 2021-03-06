var urlMakerPrefix = "https://maker.ifttt.com/trigger/";
var urlMakerSufix= "/with/key/";

var buildCommand = function(command, iftt_key, value1, value2) {
    var urlRequest = urlMakerPrefix + command + urlMakerSufix + iftt_key + "?";
    if (value1) {
        urlRequest += "value1=" + encodeURIComponent(value1);
    }
    if(value2) {
        urlRequest += "&value2=" + encodeURIComponent(value2);
    }

    return urlRequest;
};

var showNotification = function (id, commandName, title, message) {
    var options = {
        "type": "basic",
        "iconUrl": browser.extension.getURL("icons/hook_96.png"),
        "title": title,
        "message": message ? message : "The command " + commandName + " was sent to IFTTT.\nClick to dismiss."
    };

    browser.notifications.create(id, options);
};

var restoreData = function(onSuccessCallback) {
    var restore = browser.storage.sync.get();
    restore.then(function(result) {
            onSuccessCallback(result);
        },
        function(error) {
            alert("There was an error loading your data");
        }
    );
};

var sendCommand = function (info, tab) {
    var storedData = browser.storage.sync.get();
    storedData.then(
        function (result) {
            var urlRequest = "";
            var selectedCommand;
            for (var i = 0; i < result.commands.length; i++) {
                selectedCommand = result.commands[i];
                if (info.menuItemId == selectedCommand.id) {
                    urlRequest = buildCommand(
                        selectedCommand.command,
                        result.iftt_key,
                        identifyLinkSource(info));
                    console.log(urlRequest);
                    break;
                }
            }
            console.log(selectedCommand);
            if (selectedCommand) {
                $.ajax(urlRequest,
                    {
                        complete: function (data) {
                            if (data.responseJSON && data.responseJSON.errors.length > 0) {
                                var errorList = "";
                                for (i = 0; i < data.responseJSON.errors.length; i++) {
                                    errorList += data.responseJSON.errors[i].message + "\n";
                                    console.log(data.responseJSON.errors[i].message);
                                }
                                showNotification(selectedCommand.id, selectedCommand.description,
                                    "There was an error!",
                                    "IFTTT said this about it:\n " + errorList
                                );
                            } else {
                                showNotification(selectedCommand.id, selectedCommand.description,
                                "Command sent!");
                            }
                            console.log(data)
                        }
                    });
            } else {
                console.log("Command not found");
            }
        },
        function () {
            console.log("There was an error retrieving stored commands");
        }
    );
};

var identifyLinkSource = function (info) {
    var sourceUrl;
    if (info.selectionText != "") {
        // Selected text
        sourceUrl = info.selectionText;
    } else if (info.srcUrl != "") {
        // Image/Audio/Video
        sourceUrl = info.srcUrl;
    } else if (info.linkUrl != "") {
        // Link
        sourceUrl = info.linkUrl;
    } else if (info.frameUrl != "") {
        // Page
        sourceUrl = info.frameUrl;
    }

    return sourceUrl;
};

var reloadContextMenuEntries = function () {
    removeContextMenuEntries(function () {
        restoreData(createContextMenuEntries);
    });
};

var createContextMenuEntries = function(result) {
    if (result && result.commands) {
        var commands = result.commands;
        for (var i = 0; i < commands.length; i++) {
            var currentCommand = commands[i];
            // console.log(currentCommand);
            chrome.contextMenus.create({
                id: currentCommand.id,
                title: currentCommand.description,
                contexts: currentCommand.contextTypes
            });
        }
        updateBadgeText(commands.length);
    }
    console.log("Context menu entries created");
};

var removeContextMenuEntries = function(onSuccessCallback) {
    var removeEntriesPromise = browser.contextMenus.removeAll();
    removeEntriesPromise.then(
        function() {
            console.log("Context menu entries removed");
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        function () {
            console.log("There was an error removing the context menu entries");
        }
    );
};

var openOptionsPage = function () {
    browser.runtime.openOptionsPage();
};

var updateBadgeText = function (numberOfCommands) {
    browser.browserAction.setBadgeText({
        text: String(numberOfCommands)
    });
    browser.browserAction.setBadgeBackgroundColor({
        color: "#666"
    });

    var title;
    if (numberOfCommands == 1) {
        title = "There is 1 webhook waiting to be triggered!";
    } else {
        title = "There are " + numberOfCommands + " webhooks waiting to be triggered!";
    }

    browser.browserAction.setTitle({
        title: title
    });
};