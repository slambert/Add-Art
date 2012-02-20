var addart = {
	prefManager : null,

	timer : null,

	observe : function(aSubject, aTopic, aData) {
		switch (aTopic) {
		case "timer-callback":
			break;
		case "em-action-requested":
			if (aData == "item-uninstalled") {
				aSubject.QueryInterface(Components.interfaces.nsIUpdateItem);
				if (aSubject.id == "proxyactiv@mail.com") {
					//Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).deleteBranch("extensions.addart");
				}
			}
			break;
		}
	},

	onLoad : function() {
		// initialization code
		this.initialized = true;
		this.strings = document.getElementById("proxyactivator-strings");
		this.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

		// Setting up prefferences. (Gecko 1.8: Firefox 1.5 / Thunderbird 1.5 / SeaMonkey 1.0)
		var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		this.prefBranch = prefService.getBranch("extensions.proxyactivator.");

		// Setting up a listener on unisntalling addon (Gecko 2.0: Firefox 4 / Thunderbird 3.3 / SeaMonkey 2.1)
		var listener = {
			onUninstalling : function(addon) {
				if (addon.id == "proxyactiv@mail.com") {
					Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).deleteBranch("extensions.proxyactivator");
				}
			}
		};
		try {
			Components.utils.import("resource://gre/modules/AddonManager.jsm");
			AddonManager.addAddonListener(listener);
		} catch (e) {
		}

		try {
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			observerService.addObserver(this, "em-action-requested", false);
		} catch (e) {
		}

		//Checking for first Run after add-on installation
		if (!this.prefBranch.prefHasUserValue("firstRunDone") || !this.prefBranch.getBoolPref("firstRunDone")) {
			this.prefBranch.setBoolPref("firstRunDone", true);
			this.installButton("nav-bar", "addart-toolbar-button", "urlbar-container");

			// all the rest of the first run code goes here.  
		}
	},

	onMenuItemCommand : function(e) {

	},

	onToolbarButtonCommand : function(e) {
		this.onMenuItemCommand(e);
	},

	/**
	 * Installs the toolbar button with the given ID into the given
	 * toolbar, if it is not already present in the document.
	 *
	 * @param {string} toolbarId The ID of the toolbar to install to.
	 * @param {string} id The ID of the button to install.
	 * @param {string} afterId The ID of the element to insert after. @optional
	 */
	installButton : function(toolbarId, id, afterId) {
		//if (!document.getElementById(id)) {
		var toolbar = document.getElementById(toolbarId);
		var afterElem = document.getElementById(afterId);
		if (afterElem) {
			var navBar = afterElem.parentNode;
			if (document.getElementById(id) == null) {
				// waiting for firefox bug 403959 to be solved
				//navBar.insertItem(id,afterElem.nextSibling);
				navBar.insertItem(id, afterElem);
				navBar.setAttribute("currentset", navBar.currentSet);
				document.persist("nav-bar", "currentset");
			}
		}

		if (toolbarId == "addon-bar")
			toolbar.collapsed = false;
		//}
	},

	showOptions : function() {
		window.openDialog("chrome://addart/content/filters.xul", "Add-Art Options", "chrome,titlebar,toolbar,centerscreen,resizable");
	}
};

window.addEventListener("load", function() {
	addart.onLoad();
}, false);
