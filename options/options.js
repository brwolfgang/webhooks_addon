var commands = [];
var notificationID = "options_page";
var form = {
    $inputIdCommand: $("#idCommand"),
    $inputTxCommand: $("#txCommand"),
    $inputTxCommandDescription: $("#txCommandDescription"),
    $clContextTypes: $("#contextTypes").find("input"),
    clear: function () {
        this.$inputIdCommand.val("");
        this.$inputTxCommand.val("");
        this.$inputTxCommandDescription.val("");
        this.$clContextTypes.prop("checked", false);
    }
};

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
    var tableCommands = "<table id=\'tableListCommands\' class='w3-table w3-bordered'><tr><th>Command</th><th>Description</th><th>Contexts</th><th>Actions</th></tr>";
    for (var i = 0; i < commands.length; i++) {
        tableCommands +=
            "<tr><td>"
            + commands[i].command +
            "</td><td>"
            + commands[i].description +
            "</td><td>"
            + commands[i].contextTypes +
            "</td><td>" +
            "<button value='" + commands[i].id + "' class=\'btnEditCommand w3-button w3-theme-l2 w3-hover-theme w3-small\'>Edit</button>" +
            "<button value='" + commands[i].id + "' class=\'btnRemoveCommand w3-button w3-theme-l2 w3-hover-red w3-small\'>&times;</button>" +
            "</td></tr>"
    }
    if (commands.length == 0) {
        tableCommands = "<div class=\"w3-panel w3-pale-yellow w3-border w3-border-yellow w3-center\">" +
        "<p>You haven\'t created any commands yet, use the form above to create one!</p></div>";
    } else {
        tableCommands += "</table>";
    }


    $("#divCommandList").html(tableCommands);
    $('.btnRemoveCommand').on("click", function (e) {
        e.preventDefault();
        removeCommand(e.target.value);
    });
    $('.btnEditCommand').on("click", function (e) {
        e.preventDefault();
        loadCommandForEdit(e.target.value);
    });
}

function saveCommand() {
    var contextTypes = [];
    $("#contextTypes").find("input:checked").each(function(index, item) {
        contextTypes.push(item.value);
    });

    var idCommand = $("#idCommand").val();

    var command = {
        id: String(idCommand != "" ? idCommand : Date.now()),
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

    if (idCommand != "") {
        commands = commands.filter(function (command) {
            return command.id != idCommand;
        });
    }

    commands.push(command);
    form.clear();
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

function loadCommandForEdit(idCommand) {
    form.clear();

    var selectedCommand = commands.filter(function (command) {
        return command.id == idCommand;
    });

    if (selectedCommand[0]) {
        selectedCommand = selectedCommand[0];
        form.$inputIdCommand.val(selectedCommand.id);
        form.$inputTxCommand.val(selectedCommand.command);
        form.$inputTxCommandDescription.val(selectedCommand.description);

        for (var i = 0; i < selectedCommand.contextTypes.length; i++) {
            var type = selectedCommand.contextTypes[i];
            var selector =  "input[value='"+ type +"']";
            $(selector).prop("checked", true);
        }
    }
}

$("document").ready(function() {
    restoreData(putDataOnForm);
    $("#iftt_key").change(saveData);
    $("#btnSaveCommand").click(saveCommand);
    $("#btnClearCommand").click(function (e) {
        form.clear();
    });
    $("#btnReloadCommands").click(function (e) {
        reloadContextMenuEntries();
    });
    browser.storage.onChanged.addListener(function (changes) {
        console.log("Change detected: ");
        console.log(changes);
    })
});
