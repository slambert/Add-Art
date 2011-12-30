// This code checks for a new set of images in a .jar file on the server and 
// downloads it when available.  This is how new art images get to the user.

function CheckForImagesUpdate(aaExtensionPath) {
	// Constants
	const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
	const aaPreferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	// File-scope variables that we'd like to define a little early
	var date = new Date();
	var aaFileSep = null;
	var aaNextSet = null;
	var aaNextExpiration = null;
	
	// Checks to see if we have the most up-to-date set 
	var getImageSetInfo = function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", urlCheckXML, true);
		request.onreadystatechange = function (aEvt) 
			{
			  if (request.readyState == 4) 
			  {
				 if(request.status == 200)
				 {	 	 
					var imageData = request.responseXML.getElementsByTagName("images");  

					if(!aaPreferences.prefHasUserValue("extensions.add-art.currentImageSet") // if we don't have info about the current local image set, go ahead and download images
						|| imageData[0].getAttribute("set") > aaPreferences.getIntPref("extensions.add-art.currentImageSet"))
					{	
						aaNextSet = imageData[0].getAttribute("set");
						aaNextExpiration = imageData[0].getAttribute("expires");	
						downloadNewImages(imageData[0].getAttribute("url"));	
					}
				 }
			  }
			};

		request.overrideMimeType('text/xml');
		request.send(null); 

	};

	// Downloads new images and stores locally
	var downloadNewImages = function(url)
	{
		var req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.onreadystatechange = function (aEvt) 	
		{
		  if (req.readyState == 4) 
		  {
			 if(req.status == 200)
			 {	

				var outputfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				outputfile.initWithPath(aaExtensionPath + aaFileSep + "chrome" + aaFileSep + "~images.jar");

				// file is nsIFile, data is a string
				var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

				// use 0x02 | 0x10 to open file for appending.
				foStream.init(outputfile, 0x02 | 0x08 | 0x20, 0666, 0); 
				// write, create, truncate


				var bytes = req.responseText;
				foStream.write(bytes, bytes.length);
				foStream.close();

				aaPreferences.setIntPref("extensions.add-art.currentImageSet", aaNextSet);
				aaPreferences.setCharPref("extensions.add-art.expiration", aaNextExpiration);

				if(aaPreferences.getBoolPref("extensions.add-art.showUpdateAlert"))
					alert("Add-Art has downloaded new images,\nplease restart Firefox to see them.");
			 }
		  }
		};
	 	req.overrideMimeType('text/plain; charset=x-user-defined');
		req.send(null); 	  
	};
	
	// Figure out what is the correct file separator (to handle both PCs and Macs) 
	var aaFileLoc=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
	// determine the file-separator
	if (aaFileLoc.search(/\\/) != -1) 
	{
		aaFileSep = "\\";
	} 
	else 
	{
		aaFileSep = "/";
	}	

	var urlCheckXML = "http://add-art.org/extension/image_set.xml?"+date.getTime();

	// check and see if we have a new set of art (it would have been downloaded during the last
	// firefox session)
	var downloadedfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	downloadedfile.initWithPath(aaExtensionPath + aaFileSep + "chrome" + aaFileSep + "~images.jar");
	if(downloadedfile.exists())
	{
		downloadedfile.moveTo(null, "images.jar");	
	}

	// check and see if our check-for-new-images date has elapsed
	if(aaPreferences.prefHasUserValue("extensions.add-art.expiration"))
	{	
		if(date.getTime() > aaPreferences.getCharPref("extensions.add-art.expiration"))  // need to store as string because the number is too large for an int
		{		
			getImageSetInfo(); // time to check for new images
		}	
	}
	else
	{
		// if the preferences doesn't contain a "next download" timestamp, 
		//  then go ahead and download info about the current image set
		getImageSetInfo();
	}

	// showUpdateAlert turns on and off the alert telling users about new art.
	// Currently it can only be changed in about:config
	// If the user doesn't have the showUpdateAlert pref already, set it to true
	if(!aaPreferences.prefHasUserValue("extensions.add-art.showUpdateAlert")) {
		aaPreferences.setBoolPref("extensions.add-art.showUpdateAlert", true);
	}
};

//Getting a path to images.jar
try {
	//this will work on FireFox 3.6
	const aaExtensionPath = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation("development@add-art.org").getItemLocation("development@add-art.org").path;
	CheckForImagesUpdate(aaExtensionPath);
} catch (e) {
	//this will work on FireFox 4 and above
	Components.utils.import("resource://gre/modules/AddonManager.jsm");  
	  
	AddonManager.getAddonByID("development@add-art.org", function(aAddon) {
		var aaExtensionPath = aAddon.getResourceURI("chrome/images.jar").QueryInterface(Components.interfaces.nsIFileURL).file.path;
		CheckForImagesUpdate(aaExtensionPath);
	});    
}
