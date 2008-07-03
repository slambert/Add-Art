const componentID = Components.ID("{741b4765-dbc0-c44e-9682-a3182f8fa1cc}");
const componentName = "@eyebeam.org/addart;1";
const componentDescr = "Banner to art converter";

var scripts = [];

// Seed our class name to make sure it cannot be guessed
var seed = String.fromCharCode("a".charCodeAt(0) + Math.random()*26) + Math.random().toString().replace(/\W/g, '');

/*
 * Module object
 */

var module =
{
  // nsIModule interface implementation
  registerSelf: function(compMgr, fileSpec, location, type)
  {
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(componentID,
                    componentDescr,
                    componentName,
                    fileSpec, location, type);

    var catman = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(Components.interfaces.nsICategoryManager);
    catman.addCategoryEntry("app-startup", componentDescr, componentName, true, true);
  },

  unregisterSelf: function(compMgr, fileSpec, location) {
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(componentID, fileSpec);

    var catman = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(Components.interfaces.nsICategoryManager);
    catman.deleteCategoryEntry("app-startup", componentName, true);
  },

  getClassObject: function(compMgr, cid, iid)
  {
    if (!cid.equals(componentID))
      throw Components.results.NS_ERROR_NO_INTERFACE;

    if (!iid.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    return factory;
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

function NSGetModule(comMgr, fileSpec)
{
  return module;
}

/*
 * Factory object
 */

const factory = {
  // nsIFactory interface implementation
  createInstance: function(outer, iid) {
    return component;
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
 * Addart component
 */

const component = {
  init: function() {
    // Retrieve ABP component
    var abp = null;
    try {
      abp = Components.classes["@mozilla.org/adblockplus;1"].createInstance();
      if (abp && !("policy" in abp))
        abp = abp.wrappedJSObject;    // Unwrap ABP component
    } catch(e) {}

    if (!abp)
      return;

    // Install our content CSS
    var styleService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                                 .getService(Components.interfaces.nsIStyleSheetService);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                              .getService(Components.interfaces.nsIIOService);
    var uri = ioService.newURI("data:text/css,." + seed + "{-moz-binding: url(chrome://addart/content/addart.xml#frame) !important}", null, null);
    styleService.loadAndRegisterSheet(uri, styleService.USER_SHEET);

    // Install our hook
    abp.policy._addartOldShouldLoad = abp.policy.shouldLoad;
    abp.policy.shouldLoad = this.shouldLoad;

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
      data = wrapper.replace(/{{SCRIPT}}/g, data).replace(/{{SEED}}/g, seed); // lint thinks this is invalid... any way around that?
      data = converter.ConvertAndEscape('utf-8', data).replace(/\+/g, "%20");
      data = 'data:text/javascript,' + data;
      scripts.push([id, data]);
    }
  },

  shouldLoad: function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra) {
    // Let ABP handle this call first
    var result = this._addartOldShouldLoad.apply(this, arguments);

    if (result != Components.interfaces.nsIContentPolicy.ACCEPT) {
      // We only deal with blocked items
      if (contentType == Components.interfaces.nsIContentPolicy.TYPE_SCRIPT) {
        // Check whether one of our scripts matches the URL
        for (var i = 0; i < scripts.length; i++) {
          var script = scripts[i];
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
              frame.setAttribute("class", seed);
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
    this.init();
  },

  // nsISupports interface implementation
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIObserver))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
}


// small wrapper for fetching a remote stream
// -> http://forums.mozillazine.org/viewtopic.php?p=921150#921150
// TODO should be async?
// -> http://developer.mozilla.org/en/docs/Code_snippets:File_I/O#Asynchronously
// -> http://www.xulplanet.com/references/xpcomref/ifaces/nsIChannel.html#method_asyncOpen
function getContents(aURL){
  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream = Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

  var channel = ioService.newChannel(aURL,null,null);
  var input = channel.open();
  scriptableStream.init(input);
  var str = scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();
  return str;
}