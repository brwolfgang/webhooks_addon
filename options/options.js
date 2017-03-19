var commands = [];
var notificationID = "options_page";

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
        command: $("#txCommand").val().trim(),
        description: $("#txCommandDescription").val().trim(),
        contextTypes: contextTypes
    };

    if (command.command.length == 0) {
        alert("Please insert the command");
        return;
    }
    if (command.description.length == 0) {
        alert("Please insert the description");
        return;
    }
    if (command.contextTypes.length == 0) {
        alert("Please select at least one context type");
        return;
    }

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

    listCommands();
    saveData();
}

$("document").ready(function() {
    restoreData(putDataOnForm);
    $("#iftt_key").change(saveData);
    $("#btnSaveCommand").click(saveCommand);
    $("#btnReloadCommands").click(function (e) {
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
    browser.storage.onChanged.addListener(function (changes) {
        console.log("Change detected: ");
        console.log(changes);
    })
});
