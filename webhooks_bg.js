var urlMakerPrefix = "https://maker.ifttt.com/trigger/";
var urlMakerSufix= "/with/key/";

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var storedData = browser.storage.sync.get();
    storedData.then(
        function (result) {
            var urlRequest = "";
            var selectedCommand;
            for (var i = 0; i < result.commands.length; i++) {
                selectedCommand = result.commands[i];
                if (info.menuItemId == selectedCommand.id) {
                    urlRequest = buildCommand(selectedCommand.command, result.iftt_key, info.srcUrl);
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
                                for (i = 0; i < data.responseJSON.errors.length; i++) {
                                    console.log(data.responseJSON.errors[i].message);
                                }
                            } else {
                                showNotification(selectedCommand.id, selectedCommand.description);
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
});

function buildCommand(command, iftt_key, value1, value2) {
    var urlRequest = urlMakerPrefix + command + urlMakerSufix + iftt_key + "?";
    if (value1) {
        urlRequest += "value1=" + value1;
    }
    if(value2) {
        urlRequest += "&value2=" + value2;
    }

    return urlRequest;
}

function showNotification(id, commandName) {
    console.log("Trying to send notification " + commandName);
    var options = {
        "type": "basic",
        "iconUrl": browser.extension.getURL("icons/hook_96.png"),
        "title": "Command sent!",
        "message": "The command " + commandName + " was sent to IFTTT.\nClick to dismiss."
    };

    browser.notifications.create(id, options);
}