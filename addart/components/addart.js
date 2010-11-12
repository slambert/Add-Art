// Main Add-Art JavaScript Component

// Define namespace
if(!org) var org={};
if(!org.eyebeam) org.eyebeam={};
if(!org.eyebeam.addArt) org.eyebeam.addArt = {};


// *** These must be defined directly on the namespace object or things break ***
org.eyebeam.addArt.seed = String.fromCharCode("a".charCodeAt(0) + Math.random()*26) + Math.random().toString().replace(/\W/g, '');

org.eyebeam.addArt.scripts = [];
// ******************************************************************************

/*
 * Module object
 */

org.eyebeam.addArt.module =
{
	componentID: Components.ID("{741b4765-dbc0-c44e-9682-a3182f8fa1cc}"),
	componentName: "@eyebeam.org/addart;1",
	componentDescr: "Banner to art converter",
	
  // nsIModule interface implementation
  registerSelf: function(compMgr, fileSpec, location, type)
  {
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(this.componentID,
                    this.componentDescr,
                    this.componentName,
                    fileSpec, location, type);

    var catman = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(Components.interfaces.nsICategoryManager);
    catman.addCategoryEntry("app-startup", this.componentDescr, this.componentName, true, true);
  },

  unregisterSelf: function(compMgr, fileSpec, location) {
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(this.componentID, fileSpec);

    var catman = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(Components.interfaces.nsICategoryManager);
    catman.deleteCategoryEntry("app-startup", this.componentName, true);
  },

  getClassObject: function(compMgr, cid, iid)
  {
    if (!cid.equals(this.componentID))
      throw Components.results.NS_ERROR_NO_INTERFACE;

    if (!iid.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    return org.eyebeam.addArt.factory;
  },

  canUnload: function(compMgr)
  {
    return true;
  },

  // nsISupports interface implementation
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIModule))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

function myDump(aMessage) {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                       .getService(Components.interfaces.nsIConsoleService);
      consoleService.logStringMessage("add-art: " + aMessage);
}



// Adds the module object to Firefox
function NSGetModule(comMgr, fileSpec)
{
  return org.eyebeam.addArt.module;
}

/*
 * Factory object to create component
 */

org.eyebeam.addArt.factory = {
  // nsIFactory interface implementation
  createInstance: function(outer, iid) {
    return org.eyebeam.addArt.component;
  },

  // nsISupports interface implementation
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIFactory))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

/*
 * Add-Art component (does most of the heavy lifting)
 */

org.eyebeam.addArt.component = {	
  init: function() {
    // Retrieve ABP component
    var policy = null;
    var abp = null;
    myDump("logging works");
    if ("@mozilla.org/adblockplus;1" in Components.classes)
    {
      myDump("found abp1.2");
      // Adblock Plus 1.2.x or below
      abp = Components.classes["@mozilla.org/adblockplus;1"]
                              .createInstance().wrappedJSObject;
      policy= abp.policy;
    }
    else if ("@adblockplus.org/abp/public;1" in Components.classes)
    {
      myDump("found abp1.3");
      // Adblock Plus 1.3 or higher
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      const Cu = Components.utils;

      let baseURL = Cc["@adblockplus.org/abp/private;1"].getService(Ci.nsIURI);
      myDump(baseURL.spec);
      policy = Cu.import(baseURL.spec + "ContentPolicy.jsm", null).PolicyPrivate;
      myDump(policy);

      //var abpURL = Components.classes["@adblockplus.org/abp/private;1"]
                             //.getService(Components.interfaces.nsIURI);
      //Components.utils.import(abpURL.spec);
    }
    else
    {
      myDump("did not find abp");
      // Adblock Plus is not installed
      myDump(Components.classes);
    }


    // Install our content CSS
    var styleService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                                 .getService(Components.interfaces.nsIStyleSheetService);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                              .getService(Components.interfaces.nsIIOService);
    var uri = ioService.newURI("data:text/css,." + org.eyebeam.addArt.seed + "{-moz-binding: url(chrome://addart/content/addart.xml#frame) !important}", null, null);
    styleService.loadAndRegisterSheet(uri, styleService.USER_SHEET);

    // Install our hook
    // does abp.policy.shouldload exist?
    if(!policy){
      myDump("no abp.policy");
    }
    else if (! policy.shouldLoad){
      myDump("no shouldLoad");

    }
    else{
      myDump("shouldLoad exists");
    }

    policy._addartOldShouldLoad = policy.shouldLoad;
    policy.shouldLoad = this.shouldLoad;

    // Load script wrapping code
    var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                        .createInstance(Components.interfaces.nsIXMLHttpRequest);
    req.overrideMimeType("text/javascript");
    req.open("GET", "chrome://addart/content/script_wrapper.js", false);
    req.send(false);
    var wrapper = req.responseText;

    // Load scripts
    req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                    .createInstance(Components.interfaces.nsIXMLHttpRequest);
    req.open("GET", "chrome://addart/content/scripts.xml", false);
    req.send(false);
    
    
    // TODO instantiate the artbanners array from the XML
    
    // done with all that remote nonsense

    // Load <script> tag javascript ad substitution
    var converter = Components.classes["@mozilla.org/intl/texttosuburi;1"]
                              .getService(Components.interfaces.nsITextToSubURI);
    var tags = req.responseXML.documentElement.getElementsByTagName("script");
    for (var i = 0; i < tags.length; i++) {
      var tag = tags.item(i).QueryInterface(Components.interfaces.nsIDOMElement);
      var id;
      if (tag.hasAttribute("url"))
        id = tag.getAttribute("url");
      else if (tag.hasAttribute("regexp")) {
        try {
          id = new RegExp(tag.getAttribute("regexp"), "");
        }
        catch (e) {
          continue;
        }
      }
      else
        continue;

      var data = tag.QueryInterface(Components.interfaces.nsIDOM3Node).textContent;
      data = wrapper.replace(/{{SCRIPT}}/g, data).replace(/{{SEED}}/g, org.eyebeam.addArt.seed);
      data = converter.ConvertAndEscape('utf-8', data).replace(/\+/g, "%20");
      data = 'data:text/javascript,' + data;
      org.eyebeam.addArt.scripts.push([id, data]);
    }
  },

  shouldLoad: function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra) {
    // Let ABP handle this call first
    var result = this._addartOldShouldLoad.apply(this, arguments);

    if (result != Components.interfaces.nsIContentPolicy.ACCEPT) {
      // We only deal with blocked items
      if (contentType == Components.interfaces.nsIContentPolicy.TYPE_SCRIPT) {
        // Check whether one of our scripts matches the URL
        for (var i = 0; i < org.eyebeam.addArt.scripts.length; i++) {
          var script = org.eyebeam.addArt.scripts[i];
          var match = false;
          if (script[0] instanceof RegExp)
            match = contentLocation.spec.match(script[0]);
          else
            match = (contentLocation.spec == script[0]);
  
          if (match) {
            var url = script[1];
            if (typeof match != "boolean") {
              // Replace references to regexp groups ($$n$$)
              for (var j = 0; j < match.length; j++)
                url = url.replace(new RegExp("%24" + j + "%24", "g"), match[j]);
            }
            contentLocation.spec = url;
            return Components.interfaces.nsIContentPolicy.ACCEPT;
          }
        }
      }
      else if (contentType == Components.interfaces.nsIContentPolicy.TYPE_IMAGE ||
               contentType == Components.interfaces.nsIContentPolicy.TYPE_OBJECT ||
               contentType == Components.interfaces.nsIContentPolicy.TYPE_SUBDOCUMENT) {
        // Check whether this object/image has a size set
        if (context instanceof Components.interfaces.nsIDOMElement) {
          var style = context.ownerDocument.defaultView.getComputedStyle(context, "");

          // XXX: This might have issues with percentage values
          var width = parseInt(style.width);
          var height = parseInt(style.height);

          if (width && height) {
            // Replace the object/image by our frame (delayed)
            var timer = Components.classes["@mozilla.org/timer;1"]
                                  .createInstance(Components.interfaces.nsITimer);
            timer.init({observe: function() {
              var frame = context.ownerDocument.createElement("div");
              if (context.hasAttribute("style"))
                frame.setAttribute("style", context.getAttribute("style"));
              frame.setAttribute("class", org.eyebeam.addArt.seed);
              frame.setAttribute("width", width);
              frame.setAttribute("height", height);
              if(context.parentNode)
                context.parentNode.replaceChild(frame, context);
            }}, 0, timer.TYPE_ONE_SHOT);
          }
        }
      }
    }

    return result;
  },

  // nsIObserver interface implementation
  observe: function(subject, topic, data) {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService);

    switch (topic)
    {
     case "app-startup":
       observerService.addObserver(this, "final-ui-startup", false);
       break;
     case "final-ui-startup":
       observerService.removeObserver(this, "final-ui-startup");
       this.init();
       break;
    }
  },

  // nsISupports interface implementation
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIObserver))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};
