var self = require("sdk/self");
var { ToggleButton } = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var panel = require("sdk/panel");
var windows = require("sdk/windows").browserWindows;
var Request = require("sdk/request").Request;
var {Cc, Ci} = require('chrome');

//on load
exports.main = function (options, callbacks) {
	var reason = options.loadReason;
    if(reason == 'upgrade' || reason == 'install') {
    	tabs.open({
  			url: "http://www.add-art.org" //change to update info page
		});
    }

    var defaultShowsJSON = data.url("defaultShows.json");
	getDefaultSubscriptions(defaultShowsJSON);
};

//toolbar button
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

var data = self.data;
var settings = panel.Panel({
	position: button,
	width: 300,
	height: 400,
    contentURL: data.url("settings.html"),
    contentScriptFile: [data.url("jquery-1.11.2.min.js"), data.url("settings.js")],
    onHide: handleHide
});

function handleClick(state) {
	if(state.checked) {
		settings.show();
	}
}
function handleHide(state) {
	button.state('window', {checked: false});
}

//triggers every time settings panel is opened
settings.on("show", function() {
    settings.port.emit("show");
});

//triggers only first time settings panel is opened
settings.once("show", function() {
	
});

settings.port.on("save", function() {
    settings.hide();
});





//gets RSS feed links for default shows in local JSON file
function getDefaultSubscriptions(shows) {
	var subscriptions = Request({
	  url: shows,
	  overrideMimeType: "application/json",
	  onComplete: function (response) {
	    var showFeeds = response.json.shows;
	    loadSubscriptionData(showFeeds);
	  }
	});
	subscriptions.get();
}


//loops through default shows to access RSS data

var showsObject = [];
function loadSubscriptionData(showFeeds) {
	var defaultShowObject;
	for(var i = 0; i < showFeeds.length; i++) {
		getRSS(showFeeds[i].url, showFeeds.length);		
	} 
}
//requests RSS data to send to parser
function getRSS(url,count) {
	var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	request.open("GET", url);
	request.addEventListener("readystatechange", function() {
		if(request.readyState == 4) {
			if(request.responseXML) {
				var showObject = parseRSS(url, request.responseXML);
				settings.port.emit("addSubscriptions", showObject, count);
			}
		}
	}, false);
	request.send();

	// return showObject;
}

//parses through a show's RSS data
function parseRSS(url, rss) {
	var channel = rss.getElementsByTagName('item')[0];
	var item = function(type) {
		return channel.getElementsByTagName(type)[0].innerHTML;
	};

	var title = item('title');
	var description = stripCDATA(item('content:encoded'));
	var thumbnail = item('thumbnail');
	var images = item('artshow');
	var date = cleanDate(item('pubDate'));
	var link = item('showurl');

	var showObject = {
		'title' : title,
		'url' : url,
		'description' : description,
		'thumbnail' : thumbnail,
		'images' : images,
		'date' : date,
		'link' : link
	};

	return showObject
}




//Helpers
function cleanDate(date) {
	var dateObj = new Date(date);
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var day = dateObj.getDate();
	var month = months[dateObj.getMonth()];
	var year = dateObj.getUTCFullYear();
	var date = month + ' ' + day + ', ' + year;
	return date;
}

function stripHTML(html) {
    return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '');
}

function stripCDATA(html) {
    return html.replace('<![CDATA[','').replace(']]>','');
}

