$("document").ready(function() {
    commands = [];
    restoreData();
    $("#iftt_key").change(saveData);
    $("#btnSaveCommand").click(saveCommand);
    $("#btnCleanCommands").click(function (e) {
        var remove = browser.storage.sync.remove("commands");
        remove.then(
            function () {
                alert("All clear");
                restoreData();
            }, function (error) {
                alert("There was an error");
            }
        );
    });
    $("#btnReloadeCommands").click(function (e) {
        reloadContextMenuEntries();
    });
    $("#linkShowLicenses").click(function (e) {
        var $divLicences = $("#divLicenses");
        if ($divLicences.css('display') == 'block') {
            $divLicences.hide();
        } else {
            $divLicences.show();
        }
    });
    reloadContextMenuEntries();
    browser.storage.onChanged.addListener(function (changes) {
        console.log("Change detected: ");
        console.log(changes);
    })
});

function clearEverything() {
    var clear = browser.storage.sync.clear();
    clear.then(
        function () {
            console.log("Everything was cleared");
        },
        function (error) {
            console.log("There was an error clearing the storage");
        }
    );
}

function saveData(e) {
    var data = {
        "iftt_key": $("#iftt_key").val().trim(),
        "commands": commands
    };

    if (data.iftt_key.length == 0) {
        alert("Please insert a Maker IFTTT key.");
        return;
    }

    var record = browser.storage.sync.set(data);
    record.then(
        function () {
            console.log("All data was saved");
        },
        function(error){
            alert("There was an error saving your data");
            console.log(error);
        });
}

function restoreData() {
    var restore = browser.storage.sync.get();
    restore.then(putDataOnForm,
        function(error) {
            alert("There was an error loading your data");
        }
    );
}

function putDataOnForm(result) {
    // console.log(result);
    if (result.iftt_key) {
        $("#iftt_key").val(result.iftt_key);
    }

    if (result.commands) {
        commands = result.commands;
    } else {
        commands = [];
    }

    listCommands();
}

function listCommands() {
    var tableCommands = "<table id=\'tableListCommands\'><tr><th>Command</th><th>Description</th><th>Contexts</th></tr>";
    for (var i = 0; i < commands.length; i++) {
        tableCommands +=
            "<tr><td>"
            + commands[i].command +
            "</td><td>"
            + commands[i].description +
            "</td><td>"
            + commands[i].contextTypes +
            "</td><td><button value='" + commands[i].id + "' class=\'btnRemoveCommand\'>Delete</button>" +
            "</td></tr>"
    }
    if (commands.length == 0) {
        tableCommands += "<tr><td colspan=\'3\' style=\'text-align: center\' \'>Currently there are no commands saved =/</td></tr>";
    }
    tableCommands += "</table>";

    $("#divCommandList").html(tableCommands);
    $('.btnRemoveCommand').on("click", function (e) {
        removeCommand(e.target.value);
    });
}

function saveCommand() {
    var contextTypes = [];
    $("#contextTypes").find("input:checked").each(function(index, item) {
        contextTypes.push(item.value);
    });

    var command = {
        id: String(Date.now()),
        command: $("#txCommand").val(),
        description: $("#txCommandDescription").val(),
        contextTypes: contextTypes
    };
    // console.log(command);
    commands.push(command);
    saveData();
    listCommands();
}

function removeCommand(commandIdToRemove) {
    var result = confirm("Are you sure?");
    if (result) {
        commands = commands.filter(function (command) {
            return command.id != commandIdToRemove;
        });
    }

    saveData();
    listCommands();
}

function reloadContextMenuEntries() {
    removeContextMenuEntries(createContextMenuEntries);
}

function createContextMenuEntries() {
    for (var i = 0; i < commands.length; i++) {
        var currentCommand = commands[i];
        // console.log(currentCommand);
        chrome.contextMenus.create({
            id: currentCommand.id,
            title: currentCommand.description,
            contexts: currentCommand.contextTypes
        });
    }
    console.log("Context menu entries created");
}

function removeContextMenuEntries(onSuccessCallback) {
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
}