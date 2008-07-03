// We append "?" + the current unixtime stamp tot he path for image_set.xml
// to force the file to be downloaded (as opposed to using a cached version
// of the file).
var date = new Date();
var urlCheckXML = "http://add-art.org/extension/image_set.xml?"+date.getTime();
/*var urlCheckXML = "http://www.ethanham.com/test/image_set.xml?"+date.getTime();
alert("remember to change the xml path");
*/
var aaPreferences;
var aaExtensionPath;
var aaFileSep;
var aaNextSet;
var aaNextExpiration;


aaPreferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
//	aaPreferences.setCharPref("extensions.addart.asdf","asdf");	 

// figure out path to extension
aaExtensionPath = Components.classes["@mozilla.org/extensions/manager;1"]
	.getService(Components.interfaces.nsIExtensionManager)
	.getInstallLocation("development@add-art.org")
	.getItemLocation("development@add-art.org").path;

// Figure out what is the correct file separator (to handle both PCs and Macs) 
const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
aaFileLoc=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
// determine the file-separator
if (aaFileLoc.search(/\\/) != -1) 
{
	aaFileSep = "\\";
} 
else 
{
	aaFileSep = "/";
}	

// check and see if we have a new set of art (it would have been downloaded during the last
// firefox session
var downloadedfile = Components.classes["@mozilla.org/file/local;1"]
							.createInstance(Components.interfaces.nsILocalFile);
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


// Here we check and see if we have the most up-to-date set 
function getImageSetInfo()
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

}
 
// download new images and store locally
function downloadNewImages(url)
{
	var req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.onreadystatechange = function (aEvt) 	
	{
	  if (req.readyState == 4) 
	  {
		 if(req.status == 200)
		 {	

			var outputfile = Components.classes["@mozilla.org/file/local;1"]
								.createInstance(Components.interfaces.nsILocalFile);
			outputfile.initWithPath(aaExtensionPath + aaFileSep + "chrome" + aaFileSep + "~images.jar");
		
			// file is nsIFile, data is a string
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
									 .createInstance(Components.interfaces.nsIFileOutputStream);
			
			// use 0x02 | 0x10 to open file for appending.
			foStream.init(outputfile, 0x02 | 0x08 | 0x20, 0666, 0); 
			// write, create, truncate
		

			var bytes = req.responseText;
			foStream.write(bytes, bytes.length);
			foStream.close();

			aaPreferences.setIntPref("extensions.add-art.currentImageSet", aaNextSet);
			aaPreferences.setCharPref("extensions.add-art.expiration", aaNextExpiration);
			
			alert("Add-Art has downloaded new images,\nplease restart Firefox to see them.");
		 }
	  }
	};
 	req.overrideMimeType('text/plain; charset=x-user-defined');
	req.send(null); 	  
}
  
// *********************************************************************
