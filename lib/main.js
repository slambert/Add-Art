var { ToggleButton } = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var panel = require("sdk/panel");
var windows = require("sdk/windows").browserWindows;

exports.main = function (options, callbacks) {
	console.log(options);
	var reason = options.loadReason;
    if(reason == 'upgrade' || reason == 'install') {
    	tabs.open({
  			url: "http://www.add-art.org" //change to update info page
		});
    }
};

var button = ToggleButton({
	id: "add-art-icon",
	label: "Click to add art!",
	icon: {
	    "16": "./icon-16.png",
	    "32": "./icon-32.png",
	    "64": "./icon-64.png"
    },
	onClick: handleClick
});

function handleClick(state) {	
    settings.show();
}

var data = self.data;
var settings = panel.Panel({
	position: button,
	width: 300,
	height: 400,
    contentURL: data.url("settings.html"),
    contentScriptFile: [data.url("settings.js"), data.url("jquery-1.11.2.min.js")]
});

settings.on("show", function() {
    settings.port.emit("show");
});

settings.port.on("save", function () {
    settings.hide();
});
