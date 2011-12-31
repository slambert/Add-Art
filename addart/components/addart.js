// Main Add-Art JavaScript Component
const Ci = Components.interfaces;
const prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).QueryInterface(
		Components.interfaces.nsIPrefBranchInternal);

var Policy = null;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");


/*******************************************************************************
 * class definition
 ******************************************************************************/

// class constructor
function AddArtComponent() {
	this.wrappedJSObject = this;
}

// class definition
AddArtComponent.prototype = {
	// properties required for XPCOM registration: 
	classID : Components.ID("{741b4765-dbc0-c44e-9682-a3182f8fa1cc}"),
	contractID : "@eyebeam.org/addart;1",
	classDescription : "Banner to art converter",

	QueryInterface : XPCOMUtils.generateQI( [ Ci.nsIObserver ]),

	// add to category manager
	_xpcom_categories : [ {
		category : "profile-after-change"
	}
	],

	// This will help to write debug messages to console
	myDump : function(aMessage) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage("add-art: " + aMessage);
	},

	init : function() {
		// First, we check if ABP is installed
		try {
			var abpURL = Components.classes["@adblockplus.org/abp/private;1"].getService(Components.interfaces.nsIURI);
			Components.utils.import(abpURL.spec + "ContentPolicy.jsm");
		} catch (e) {
			this.myDump("No AdBlock Plus v1.3 or higher");
			return false;
		}
		
		// if everything is OK we continue 
		if (!Policy)
			return false;
		
		this.loadImgArray();

		// Installing our hook
		// does Policy.processNode exist?
		if (!Policy.processNode) {
			this.myDump("no processNode");
		}
		
		Policy.oldprocessNode = Policy.processNode;
		Policy.processNode = this.processNodeForAdBlock;

		this.setPref("extensions.adblockplus.fastcollapse",false);

		return true;
	},

	processNodeForAdBlock : function(wnd, node, contentType, location, collapse) {
		//this will be run in context of AdBlock Plus
		return Components.classes['@eyebeam.org/addart;1'].getService().wrappedJSObject.processNodeForAddArt(wnd, node, contentType, location, collapse);
	},
	
	processNodeForAddArt : function(wnd, node, contentType, location, collapse) {
		//this will be run in context of Add-Art
		if (!Policy)
			return Components.interfaces.nsIContentPolicy.ACCEPT;
		if (/^chrome:\//i.test(location))
			return Components.interfaces.nsIContentPolicy.ACCEPT;
		if (!node || !node.ownerDocument || !node.tagName)
			return Components.interfaces.nsIContentPolicy.ACCEPT;
		if (node.hasAttribute("NOAD"))
			return Components.interfaces.nsIContentPolicy.ACCEPT;
		if (contentType == Components.interfaces.nsIContentPolicy.TYPE_STYLESHEET ||
				contentType == Components.interfaces.nsIContentPolicy.TYPE_DOCUMENT ||
				contentType > Components.interfaces.nsIContentPolicy.TYPE_SUBDOCUMENT)
			return Policy.oldprocessNode(wnd, node, contentType, location, collapse);
		if (node.ownerDocument.getElementsByTagName('HTML')[0] && node.ownerDocument.getElementsByTagName('HTML')[0].getAttribute('inAdScript') == 'true') {
			//Here possible should be done some work with script-based ads
			if (contentType == Components.interfaces.nsIContentPolicy.TYPE_SCRIPT)
				return Components.interfaces.nsIContentPolicy.ACCEPT;
		} else {
			if (Policy.oldprocessNode(wnd, node, contentType, location, collapse) == 1)
				return Components.interfaces.nsIContentPolicy.ACCEPT;
			if (contentType == Components.interfaces.nsIContentPolicy.TYPE_SCRIPT) {
				//Here possible should be done some work with script-based ads 
				return Components.interfaces.nsIContentPolicy.REJECT_REQUEST;
			}
		}
		try {
			// Replacing Ad Node to Node with Art
			var RNode = this.findAdNode(node);
			if (RNode.parentNode) {
				RNode.parentNode.replaceChild(this.transform(RNode, location), RNode);	
			}
		} catch(e) {
			this.myDump("Error in: " + e.fileName +", line number: " + e.lineNumber +", " + e);
		}
		return Components.interfaces.nsIContentPolicy.REJECT_REQUEST;
	},

	findAdNode : function(node) {
		// if(node.parentNode.childNodes.length==1)
		// return this.findAdNode(node.parentNode);
		if (node.parentNode && node.parentNode.tagName == "A")
			return this.findAdNode(node.parentNode);
		if (node.parentNode && node.parentNode.tagName == "OBJECT")
			return this.findAdNode(node.parentNode);
		if (node.parentNode && node.parentNode.hasAttribute('onclick'))
			return this.findAdNode(node.parentNode);
		return node;
	},
	
	loadImgArray : function() {
		this.ImgArray = new Array();
		this.ImgArray.push( [ 728, 90, ] );
        this.ImgArray.push( [ 468, 60, ] );
        this.ImgArray.push( [ 392, 72, ] );
        this.ImgArray.push( [ 1698, 321 ] );
        this.ImgArray.push( [ 120, 240 ] );
        this.ImgArray.push( [ 240, 400 ] );
        this.ImgArray.push( [ 180, 150 ] );
        this.ImgArray.push( [ 300, 250 ] );
        this.ImgArray.push( [ 336, 280 ] );
        this.ImgArray.push( [ 300, 600 ] );
        this.ImgArray.push( [ 160, 600 ] );
        this.ImgArray.push( [ 120, 600 ] );
        this.ImgArray.push( [ 250, 250 ] );
        this.ImgArray.push( [ 125, 125 ] );
        this.ImgArray.push( [ 150, 60 ] );
        this.ImgArray.push( [ 88, 31 ] );
        this.ImgArray.push( [ 184, 90 ] );
	},

	askLink : function(width, height) {
		// Find this.ImgArray with minimal waste (or need - in this case it will be shown in full while mouse over it) of space
		var optimalbanners = null;
		var minDiff = Number.POSITIVE_INFINITY;
		for ( var i = 0; i < this.ImgArray.length; i++) {
			var diff = Math.abs(width / height - this.ImgArray[i][0] / this.ImgArray[i][1]);
			if (Math.abs(diff) < Math.abs(minDiff)) {
				minDiff = diff;
				optimalbanners = [ i ];
			} else if (diff == minDiff) {
				optimalbanners.push(i);
			}
		}

		var optimalBanner = [];
		minDiff = Number.POSITIVE_INFINITY;
		for (i = 0; i < optimalbanners.length; i++) {
			var diff = Math.abs(width * height - this.ImgArray[optimalbanners[i]][0] * this.ImgArray[optimalbanners[i]][1]);
			if (diff < minDiff) {
				minDiff = diff;
				optimalBanner = [ optimalbanners[i] ];
			} else if (diff == minDiff) {
				optimalBanner.push(optimalbanners[i]);
			}
		}
		return this.ImgArray[optimalBanner[Math.floor(Math.random() * optimalBanner.length)]];
	},

	createConteneur : function(OldElt, l, L, location) {
		// This replaces Ad element to element with art
		
		var newElt = OldElt.ownerDocument.createElement("div");
		newElt.setAttribute("NOAD", "true");
		
		// Copying style from old to new element and doing some replacing of it 
		newElt.setAttribute("style", OldElt.getAttribute("style"));
		if (OldElt.ownerDocument.defaultView && OldElt.ownerDocument.defaultView.getComputedStyle(OldElt, null)) {
			EltStyle = OldElt.ownerDocument.defaultView.getComputedStyle(OldElt, null);
			newElt.style.position = EltStyle.getPropertyValue('position');
			if (EltStyle.getPropertyValue('display') == 'inline' || EltStyle.getPropertyValue('display') == 'inline-table')
				newElt.style.display = "inline-block";
			else
				newElt.style.display = EltStyle.getPropertyValue('display');
			newElt.style.visibility = EltStyle.getPropertyValue('visibility');
			newElt.style.zIndex = EltStyle.getPropertyValue('z-index');
			newElt.style.clip = EltStyle.getPropertyValue('clip');
			newElt.style.float = EltStyle.getPropertyValue('float');
			newElt.style.clear = EltStyle.getPropertyValue('clear');
		}
		newElt.style.background = "";
		if (OldElt.hasAttribute("id"))
			newElt.setAttribute("id", OldElt.getAttribute("id"));
		if (OldElt.hasAttribute("name"))
			newElt.setAttribute("name", OldElt.getAttribute("name"));
		if (OldElt.hasAttribute("class"))
			newElt.setAttribute("class", OldElt.getAttribute("class"));

		newElt.style.height = l + "px";
		newElt.style.width = L + "px";
		newElt.style.overflow = "hidden";
		newElt.style.cursor = "pointer";
		newElt.title = "Replaced by Add-Art";
		
		// Setting Art to be shown in full while is over it
		newElt.setAttribute("onmouseover","this.style.overflow = 'visible';this.style.zIndex= 100000;");
		newElt.setAttribute("onmouseout","this.style.overflow = 'hidden';this.style.zIndex= 0;");
		newElt.setAttribute("onclick","window.top.location = 'http://add-art.org/';");
		
		var img = OldElt.ownerDocument.createElement("img");
		img.setAttribute("NOAD", "true");
		img.setAttribute("border", "0");
		var Img = this.askLink(L, l);
		
		// Select banner URL
        // use the current URL to generate a number b/w 1 and 8 (to maintain some persistence)
		if (location) {
			var randomImage8 = location.spec.charCodeAt( location.spec.length - 6 ) % 8 + 1;
		} else {
			var randomImage8 = Math.floor(Math.random()*8);
		}
        
        // pick the image
        var filename = randomImage8+"artbanner"+Img[0]+"x"+Img[1]+".jpg";
        var url = "chrome://addart/skin/"+filename;
		
        img.setAttribute("src", url);

		if (Img[1] * l / Img[2] < L) {
			img.style.width = L + "px";
			img.style.marginTop = parseInt((l - Img[1] * L / Img[0]) / 2) + 'px';
		} else {
			img.style.height = l + "px";
			img.style.marginLeft = parseInt((L - Img[0] * l / Img[1]) / 2) + 'px';
		}
		newElt.appendChild(img);
		return newElt;
	},

	typeofSize : function(Str_size) {
		if (Str_size == "auto")
			return "auto";
		if (Str_size == "inherit")
			return "inherit";
		if (Str_size.indexOf('%') > -1)
			return "percentage";
		return "pixel";
	},

	getSize : function(prop, elt) {
		if (elt.ownerDocument) {
			if (elt.ownerDocument.defaultView && elt.ownerDocument.defaultView.getComputedStyle(elt, null)) {
				var wnd = elt.ownerDocument.defaultView;
				var compW = wnd.getComputedStyle(elt, null).getPropertyValue(prop);
				if (elt.parentNode)
					var parentcompW = wnd.getComputedStyle(elt.parentNode, null).getPropertyValue(prop);
			}
		}

		if (!compW) {
			if (elt.style[prop])
				compW = elt.style[prop];
			else if (elt[prop])
				compW = elt[prop];
			else
				compW = 0;
		}

		var x;
		if (this.typeofSize(compW) == "percentage") {
			if (this.typeofSize(parentcompW) !== "pixel")
				x = 0;
			else
				x = parseInt(parseInt(compW) * parseInt(parentcompW) / 100);
		} else if (this.typeofSize(compW) == "auto")
			x = 0;
		else if (this.typeofSize(compW) == "inherit") {
			if (this.typeofSize(parentcompW) !== "pixel")
				x = 0;
			else
				x = parseInt(parentcompW);
		} else
			x = parseInt(compW);
		return x;
	},

	transform : function(ToReplace, location) {
		var Larg = this.getSize("height", ToReplace);
		var Long = this.getSize("width", ToReplace);

		if (Long == 0 || Larg == 0) {
			var placeholder = ToReplace.ownerDocument.createElement("div");
			placeholder.setAttribute("NOAD", "true");
			if (ToReplace.hasAttribute("style"))
				placeholder.setAttribute("style", ToReplace.getAttribute("style"));
			if (placeholder.style.background)
				placeholder.style.background = "";
			var Nodes = ToReplace.childNodes;
			for ( var i = 0; i < Nodes.length; i++) {
				if (Nodes[i].nodeType == Components.interfaces.nsIContentPolicy.TYPE_OTHER)
					placeholder.appendChild(this.transform(Nodes[i]), location);
			}
			if (ToReplace.hasAttribute("id"))
				placeholder.setAttribute("id", ToReplace.getAttribute("id"));
			if (ToReplace.hasAttribute("name"))
				placeholder.setAttribute("name", ToReplace.getAttribute("name"));
			if (ToReplace.hasAttribute("class"))
				placeholder.setAttribute("class", ToReplace.getAttribute("class"));
			if (ToReplace.style.display == 'none')
				placeholder.style.display = 'none';
		} else {
			var placeholder = this.createConteneur(ToReplace, Larg, Long, location);
		}
		return placeholder;
	},
	
	getPref: function(PrefName) {
		var Type = prefs.getPrefType(PrefName);
		if(Type == prefs.PREF_BOOL)
			return prefs.getBoolPref(PrefName);
		else if (Type==prefs.PREF_STRING)
			return prefs.getCharPref(PrefName);
		else if (Type==prefs.PREF_INT)
			return prefs.getIntPref(PrefName);
	},
	
	setPref: function(PrefName, prefValue) {
		if(this.getPref(PrefName)!==prefValue) {
			var Type = prefs.getPrefType(PrefName);
    		if (Type==prefs.PREF_BOOL)
				prefs.setBoolPref(PrefName, prefValue);
			else if (Type==prefs.PREF_STRING)
				prefs.setCharPref(PrefName, prefValue);
			else if (Type==prefs.PREF_INT)
				prefs.setIntPref(PrefName, prefValue);
		}
	},
	
	// nsIObserver interface implementation
	observe : function(aSubject, aTopic, aData) {
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		switch (aTopic) {
		case "profile-after-change":
			// Doing initialization stuff on FireFox start
			this.init();
			break;
		}
	}
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4,
 * SeaMonkey 2.1). XPCOMUtils.generateNSGetModule was introduced in Mozilla 1.9
 * (Firefox 3.0).
 */
if (XPCOMUtils.generateNSGetFactory)
	var NSGetFactory = XPCOMUtils.generateNSGetFactory( [ AddArtComponent ]);
else
	var NSGetModule = XPCOMUtils.generateNSGetModule( [ AddArtComponent ]);