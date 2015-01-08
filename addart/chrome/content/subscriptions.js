/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */
Components.utils.import("resource://gre/modules/Services.jsm");

const aaPreferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
const nsIFilePicker = Components.interfaces.nsIFilePicker;

/**
 * Initialization function, called when the window is loaded.
 */
function onLoad()
{
	addDefaultSubscriptionList();

	var subscriptions = getUserSubscriptions();
	if(subscriptions) {
		chainedRequest(subscriptions);
	}


	E("enableMoreAdToHide").setChecked(getMoreAds());
	E("expandImages").setChecked(getExpandImages());


	E("subscriptions").addEventListener('select', function(e) {
		var xhtml = 'http://www.w3.org/1999/xhtml';
		var description = this.selectedItem._data.subscription.description;
		var box = E('details');
		var div = document.createElementNS(xhtml,'div');
		if(box.hasChildNodes) {
			for(var i=0;i<box.childNodes.length;i++) {
				box.removeChild(box.childNodes[i]);
			} 
		}
		var parser = new DOMParser();
		var html = parser.parseFromString(description, 'text/html').documentElement;
		box.style.overflow = "hidden";
		div.style.overflow = "auto";
		div.style.height = "350px";
		box.appendChild(div);
		div.appendChild(html);
	});
}

function getUserSubscriptions() {
	if (aaPreferences.prefHasUserValue("extensions.add-art.imageSetXmlUrlUser")) {
		return aaPreferences.getCharPref("extensions.add-art.imageSetXmlUrlUser").split('|');
	}
}

function chainedRequest(urls) {
	if(!urls.length) {
		return;
	}

	request = new XMLHttpRequest();
	var url = urls.pop(0);
	request.open("GET", url);
	request.addEventListener("readystatechange", function() {
		if(request.readyState == 4) {
			if(request.responseXML) {
				FillSubscriptionListFromRSS(url, request.responseXML);
				makeCheckOnSubscriptions();
			}
			
			chainedRequest(urls);
		}
	}, false);
	request.send();
}
function addDefaultSubscriptionList() {
	var defaultShows = [
		'http://add-art.org/category/eyebeam/feed/',
		'http://add-art.org/category/rhizome/feed/',
		'http://add-art.org/category/brooklyn-museum/feed/',
		'http://add-art.org/category/kadist/feed/',
		'http://add-art.org/category/nasa/feed/'
	];

	for(var i=0;i<defaultShows.length;i++) {
		addDefaultSubscription(defaultShows[i]);	
	}
}
function addDefaultSubscription(url) {
	var request = new XMLHttpRequest();
	request.open("GET", url);
	request.addEventListener("load", function()
	{	
		try {
			FillSubscriptionListFromRSS(url, request.responseXML);
			makeCheckOnSubscriptions();
		}
		catch(e){}

		var subscriptions = getUserSubscriptions();
		if(subscriptions) {
			chainedRequest(subscriptions);
		}

	}, false);
	request.send();	
}

function FillSubscriptionList(subscriptionUrlMain) {
	var request = new XMLHttpRequest();
	request.open("GET", subscriptionUrlMain);
	request.addEventListener("load", function()
	{	
		try {
			FillSubscriptionListFromRSS(subscriptionUrlMain, request.responseXML);
			makeCheckOnSubscriptions();
		}
		catch(e){}

		var subscriptions = getUserSubscriptions();
		if(subscriptions) {
			chainedRequest(subscriptions);
		}

	}, false);
	request.send();	
}

function nicer_date(date) {
	var diff = new Date() - date;
	var d = {
			D:date.getDate(),
			M:monthNames[date.getMonth()],
			Y:(date.getYear()+1900).toString(),
		};

	return d.M+' '+d.D+' '+d.Y;
}

function stripHTML(html) {
    return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '');
}

function stripCDATA(html) {
    return html.replace('<![CDATA[','').replace(']]>','');
}

function FillSubscriptionListFromRSS(url, rss) {
		var channel = function(type) {
			return rss.getElementsByTagName(type)[0];
		};

		var first = channel('item');

		var item = function(type) {
			return first.getElementsByTagName(type)[0];
		};

		
		
		var description = item('content:encoded').firstChild.textContent;
		if(description.length > 40) {

			var summary = description.substring(0, 40) + '...';
		} 
		else {
			var summary = description;
		}
		summary = stripHTML(summary);

		var homepage = channel('showurl').innerHTML;
		if(homepage=="") {
			homepage='http://add-art.org';
		}
		var img = channel('thumbnail').innerHTML;

		var subscr = {
		title: item('title').innerHTML,
		summary: summary,
		description: description,
		url: url,
		homepage: homepage,
		lastUpdate: nicer_date(new Date(channel('lastBuildDate').innerHTML)),
		image: img,
	};
	var data = {
		__proto__:null,
		subscription: subscr,
		isExternal: false,
		downloading: false,
		disabledFilters: null,
	};
	var node = Templater.process(E("subscriptionTemplate"), data);
	E("subscriptions").appendChild(node);
	E("loading").style.display = 'none';
	E("subscriptions_hbox").style.visibility = 'visible';
}

function makeCheckOnSubscriptions() {
	var subscriptions = E("subscriptions");
	var current = aaPreferences.getCharPref("extensions.add-art.imageSetXmlUrl");

	if(!current) {
		return;
	}

	for(var i=0; i<subscriptions.itemCount; i++) {
		var item = subscriptions.getItemAtIndex(i);

		if(item._data.subscription.url == current) {
			subscriptions.selectedIndex = i;
		}
	}
}

function onClose() {
	aaPreferences.setCharPref("extensions.add-art.adLink", E("subscriptions").selectedItem._data.subscription.homepage);
	aaPreferences.setCharPref("extensions.add-art.imageSetXmlUrl", E("subscriptions").selectedItem._data.subscription.url);
	aaPreferences.setCharPref("extensions.add-art.lastUpdate", '0');
	aaPreferences.setCharPref("extensions.add-art.nextCheck", '0');
	
	aaPreferences.setBoolPref("extensions.add-art.enableMoreAds", E("enableMoreAdToHide").checked);
	aaPreferences.setBoolPref("extensions.add-art.expandImages", E("expandImages").checked);

	this.close();
}

function setMoreAds(enabled) {
	aaPreferences.setBoolPref("extensions.add-art.enableMoreAds", enabled);
}

function getMoreAds() {
	if (aaPreferences.prefHasUserValue("extensions.add-art.enableMoreAds")) 
		return aaPreferences.getBoolPref("extensions.add-art.enableMoreAds");
	else
		return false;
}

function setExpandImages(enabled) {
	aaPreferences.setBoolPref("extensions.add-art.expandImages", enabled);
}

function getExpandImages() {
	if (aaPreferences.prefHasUserValue("extensions.add-art.expandImages"))
		return aaPreferences.getBoolPref("extensions.add-art.expandImages");
	else
		return false;
}

function loadInBrowser(url) {
	var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
	win.openUILinkIn(url, 'tab');
}

function addSubscription() {
	var url = prompt('Please enter the URL of the new subscription:');
	if(url) {
		if (!url.match(/^http([s]?):\/\/.*/)) {
			s = url;
			url = 'http://'+s;
		}
		addUserSubscription(url);
		updateSubscriptionList();
	}
}

function addUserSubscription(url) {
	var current = getUserSubscriptions();
	if(!current) {
		aaPreferences.setCharPref("extensions.add-art.imageSetXmlUrlUser",url);
	}
	else {
		current.push(url);
		aaPreferences.setCharPref("extensions.add-art.imageSetXmlUrlUser",current.join('|'));
	}
}

function updateSubscriptionList() {
	while (E("subscriptions").firstChild != null) {
		E("subscriptions").removeChild(E("subscriptions").firstChild);
	}
	addDefaultSubscriptionList();
}

/**
 * Template processing functions.
 * 
 * @class
 */
var Templater =
{
	/**
	 * Processes a template node using given data object.
	 */
	process: function(/** Node */ template, /** Object */ data) /** Node */
	{
		// Use a sandbox to resolve attributes (for convenience, not security)
		let sandbox = Cu.Sandbox(window);
		for (let key in data)
			sandbox[key] = data[key];
		
		sandbox.formatTime = formatTime;

		// Clone template but remove id/hidden attributes from it
		let result = template.cloneNode(true);
		result.removeAttribute("id");
		result.removeAttribute("hidden");
		result._data = data;

		// Resolve any attributes of the for attr="{obj.foo}"
		let conditionals = [];
		let nodeIterator = document.createNodeIterator(result, NodeFilter.SHOW_ELEMENT, null, false);
		for (let node = nodeIterator.nextNode(); node; node = nodeIterator.nextNode())
		{
			if (node.localName == "if")
				conditionals.push(node);
			for (let i = 0; i < node.attributes.length; i++)
			{
				let attribute = node.attributes[i];
				let len = attribute.value.length;
				if (len >= 2 && attribute.value[0] == "{" && attribute.value[len - 1] == "}")
					attribute.value = Cu.evalInSandbox(attribute.value.substr(1, len - 2), sandbox);
			}
		}

		// Process <if> tags - remove if condition is false, replace by their
		// children
		// if it is true
		for each (let node in conditionals)
		{
			let fragment = document.createDocumentFragment();
			let condition = node.getAttribute("condition");
			if (condition == "false")
				condition = false;
			for (let i = 0; i < node.childNodes.length; i++)
			{
				let child = node.childNodes[i];
				if (child.localName == "elif" || child.localName == "else")
				{
					if (condition)
						break;
					condition = (child.localName == "elif" ? child.getAttribute("condition") : true);
					if (condition == "false")
						condition = false;
				}
				else if (condition)
					fragment.appendChild(node.childNodes[i--]);
			}
			node.parentNode.replaceChild(fragment, node);
		}

		return result;
	},

	/**
	 * Updates first child of a processed template if the underlying data
	 * changed.
	 */
	update: function(/** Node */ template, /** Node */ node)
	{
		if (!("_data" in node))
			return;
		let newChild = Templater.process(template.firstChild, node._data);
		delete newChild._data;
		node.replaceChild(newChild, node.firstChild);
	},

	/**
	 * Walks up the parent chain for a node until the node corresponding with a
	 * template is found.
	 */
	getDataNode: function(/** Node */ node) /** Node */
	{
		while (node)
		{
			if ("_data" in node)
				return node;
			node = node.parentNode;
		}
		return null;
	},

	/**
	 * Returns the data used to generate the node from a template.
	 */
	getDataForNode: function(/** Node */ node) /** Object */
	{
		node = Templater.getDataNode(node);
		if (node)
			return node._data;
		else
			return null;
	},

	/**
	 * Returns a node that has been generated from a template using a particular
	 * data object.
	 */
	getNodeForData: function(/** Node */ parent, /** String */ property, /** Object */ data) /** Node */
	{
		for (let child = parent.firstChild; child; child = child.nextSibling)
			if ("_data" in child && property in child._data && child._data[property] == data)
				return child;
		return null;
	}
};
