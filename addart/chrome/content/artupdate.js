// This code checks for a new set of images in a .jar file on the server and 
// downloads it when available.  This is how new art images get to the user.

if(!org) var org={};
if(!org.eyebeam) org.eyebeam={};
if(!org.eyebeam.addArt) org.eyebeam.addArt = {};

org.eyebeam.addArt.artUpdater = {};

artUpdater = function(){
	// object variables
	this.date = new Date();
	this.urlCheckXML = null;
	this.aaPreferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	this.aaExtensionPath = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation("development@add-art.org").getItemLocation("development@add-art.org").path;
	this.aaFileSep = null;
	this.aaFileLoc = null;
	this.aaNextSet = null;
	this.aaNextExpiration = null;
	this.DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
	this.downloadedfile = null;
	
	// Here we check and see if we have the most up-to-date set 
	var getImageSetInfo = function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", this.urlCheckXML, true);
		request.onreadystatechange = function (aEvt) 
			{
			  if (request.readyState == 4) 
			  {
				 if(request.status == 200)
				 {	 	 
					var imageData = request.responseXML.getElementsByTagName("images");  

					if(!this.aaPreferences.prefHasUserValue("extensions.add-art.currentImageSet") // if we don't have info about the current local image set, go ahead and download images
						|| imageData[0].getAttribute("set") > this.aaPreferences.getIntPref("extensions.add-art.currentImageSet"))
					{	
						this.aaNextSet = imageData[0].getAttribute("set");
						this.aaNextExpiration = imageData[0].getAttribute("expires");	
						this.downloadNewImages(imageData[0].getAttribute("url"));	
					}
				 }
			  }
			};

		request.overrideMimeType('text/xml');
		request.send(null); 

	};

	// download new images and store locally
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
				outputfile.initWithPath(this.aaExtensionPath + this.aaFileSep + "chrome" + this.aaFileSep + "~images.jar");

				// file is nsIFile, data is a string
				var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

				// use 0x02 | 0x10 to open file for appending.
				foStream.init(outputfile, 0x02 | 0x08 | 0x20, 0666, 0); 
				// write, create, truncate


				var bytes = req.responseText;
				foStream.write(bytes, bytes.length);
				foStream.close();

				this.aaPreferences.setIntPref("extensions.add-art.currentImageSet", this.aaNextSet);
				this.aaPreferences.setCharPref("extensions.add-art.expiration", this.aaNextExpiration);

				if(this.aaPreferences.getBoolPref("extensions.add-art.showUpdateAlert"))
					alert("Add-Art has downloaded new images,\nplease restart Firefox to see them.");
			 }
		  }
		};
	 	req.overrideMimeType('text/plain; charset=x-user-defined');
		req.send(null); 	  
	};
	
	// Figure out what is the correct file separator (to handle both PCs and Macs) 
	this.aaFileLoc=(new this.DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
	// determine the file-separator
	if (this.aaFileLoc.search(/\\/) != -1) 
	{
		this.aaFileSep = "\\";
	} 
	else 
	{
		this.aaFileSep = "/";
	}	

	this.urlCheckXML = "http://add-art.org/extension/image_set.xml?"+this.date.getTime();

	// check and see if we have a new set of art (it would have been downloaded during the last
	// firefox session
	this.downloadedfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	this.downloadedfile.initWithPath(this.aaExtensionPath + this.aaFileSep + "chrome" + this.aaFileSep + "~images.jar");
	if(this.downloadedfile.exists())
	{
		this.downloadedfile.moveTo(null, "images.jar");	
	}

	// check and see if our check-for-new-images date has elapsed
	if(this.aaPreferences.prefHasUserValue("extensions.add-art.expiration"))
	{	
		if(this.date.getTime() > this.aaPreferences.getCharPref("extensions.add-art.expiration"))  // need to store as string because the number is too large for an int
		{		
			this.getImageSetInfo(); // time to check for new images
		}	
	}
	else
	{
		// if the preferences doesn't contain a "next download" timestamp, 
		//  then go ahead and download info about the current image set
		this.getImageSetInfo();
	}

	// showUpdateAlert turns on and off the alert telling users about new art.
	// Currently it can only be changed in about:config
	// If the user doesn't have the showUpdateAlert pref already, set it to true
	if(!this.aaPreferences.prefHasUserValue("extensions.add-art.showUpdateAlert")) {
		this.aaPreferences.setBoolPref("extensions.add-art.showUpdateAlert", true);
	}
};

//artUpdater.initialize();

// *********************************************************************
