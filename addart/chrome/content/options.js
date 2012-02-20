var addartOptions = {

	onLoad: function() {
		//document.getElementById("AC_expand").checked = AdChangeForAdBlockPlusComponent.getPref("addart.expand");
		var list = document.getElementById("list");
  	},
	
  	addSubscriptions : function (list, parent, level, parentTitle, parentURL)
  	{


  				var item = document.createElement("richlistitem");
  				item.setAttribute("_title", "Tttttiiiitle");
  				item.setAttribute("_url", "http://url.com/");
  				item.setAttribute("tooltiptext", "ttoooooltiptext");

  				var title = document.createElement("description");
  				if (true/*isFirst*/)
  				{
  					/*if (Utils.checkLocalePrefixMatch(node.getAttribute("prefixes")))
  						title.setAttribute("class", "subscriptionTitle localeMatch");
  					else*/
  						title.setAttribute("class", "subscriptionTitle");
  					title.textContent = "SomeTitle" + " ( specialization )";
  					mainTitle = ("Maintitle");
  					mainURL = ("http://main.url");
  					isFirst = false;
  				}
  				title.setAttribute("flex", "1");
  				title.style.marginLeft = (20 * 0/*level*/) + "px";
  				item.appendChild(title);
  		
  				var variantTitle = document.createElement("description");
  				variantTitle.setAttribute("class", "variant");
  				variantTitle.textContent = "VariantTitle";
  				variantTitle.setAttribute("crop", "end");
  				item.appendChild(variantTitle);

  				list.appendChild(item);
  			
  	},
	
	doOK: function() {
    	AdChangeForAdBlockPlusComponent.setPref("addart.enabled",document.getElementById("AC_enableCheckbox").checked);
		AdChangeForAdBlockPlusComponent.setPref("addart.percentage",parseInt(document.getElementById("AC_Percentage").value));
		var imgorigin = "";
		if(document.getElementById("AC_enableLocal").checked)
			imgorigin = "local";
		if(document.getElementById("AC_enableFlickr").checked) {
			if(imgorigin=="")
				imgorigin = "flickr";
			else
				imgorigin += ",flickr";
		}
		if(document.getElementById("AC_enableFacebook").checked) {
			if(imgorigin=="")
				imgorigin = "facebook";
			else
				imgorigin += ",facebook";
		}
		AdChangeForAdBlockPlusComponent.setPref("addart.imgorigin",imgorigin);
		AdChangeForAdBlockPlusComponent.setPref("addart.minwidth",document.getElementById("AC_MinWidth").value);
		AdChangeForAdBlockPlusComponent.setPref("addart.minheight",document.getElementById("AC_MinHeight").value);
		AdChangeForAdBlockPlusComponent.setPref("addart.precisionerror",document.getElementById("AC_PrecisionError").value);
		AdChangeForAdBlockPlusComponent.setPref("addart.IframePercentage",document.getElementById("AC_IframeFrequency").value);
		AdChangeForAdBlockPlusComponent.setPref("addart.IframeEnabled",document.getElementById("AC_enableIframe").checked);
		AdChangeForAdBlockPlusComponent.setPref("addart.flickrNb",document.getElementById("AC_FlickrNb").value);
		AdChangeForAdBlockPlusComponent.setPref("addart.expand",document.getElementById("AC_expand").checked);
		var content = '<?xml version="1.0" encoding="ISO-8859-1"?>\n<widgets>\n';
		for (var i=0;i< window.frames.gadgetiframe.TmpGadgetArray.length;i++) {
			content+='<widget	name="'+window.frames.gadgetiframe.TmpGadgetArray[i][0].replace(/&/gi,'&amp;')+'"\nselected="'+window.frames.gadgetiframe.TmpGadgetArray[i][1]+'"\nminheight="'+parseInt(window.frames.gadgetiframe.TmpGadgetArray[i][2])+'"\nminwidth="'+parseInt(window.frames.gadgetiframe.TmpGadgetArray[i][3])+'"\nminarea="'+parseInt(window.frames.gadgetiframe.TmpGadgetArray[i][4])+'"></widget>\n'
		}
		content+='</widgets>';
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
		file.append("AdChange");
		file.append("GadgetList.xml");
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
								 createInstance(Components.interfaces.nsIFileOutputStream);
		foStream.init(file, -1, 0777, 0); 
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
								  createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "ISO-8859-1", 0, 0);
		converter.writeString(content);
		converter.close();
		AdChangeForAdBlockPlusComponent.loadGadgetArray();
		window.close();
	},
	
	doCancel: function() {
		if (document.getElementById("btnOK").disabled==false)
    		window.close();
		else {
			if(confirm(document.getElementById("bundle_addart").getString("cancel.confirm"))) {
				AdChangeForAdBlockPlusComponent.setPref("addart.directory",document.getElementById("AC_Directory").value);
				AdChangeForAdBlockPlusComponent.setPref("addart.flickr",document.getElementById("AC_FlickrSearch").value);
				AdChangeForAdBlockPlusComponent.setPref("addart.facebook",document.getElementById("AC_Facebook").value);
				window.close();
			}	
		}
	},

 	ChoseDir: function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, document.getElementById("bundle_addart").getString("dir.select"), nsIFilePicker.modeGetFolder);
		var res = fp.show();
		if (res == nsIFilePicker.returnOK){
			document.getElementById("btnOK").disabled = true;
  			var dir = fp.file;
			document.getElementById("AC_Directory").value = dir.path;
			document.getElementById("selectdir").style.visibility="hidden";
			document.getElementById("progressbox").style.visibility="visible";
			document.getElementById("progressbar").value="0";
			document.getElementById("progresstext").value="( 0 / ? " +document.getElementById("bundle_addart").getString("images")+" )";
			addartOptions.deleteTMP("local");
			var allowedFileType = ["png", "jpeg", "gif","jpg", "bmp"];	
			var items = dir.directoryEntries;
			var FileArray = new Array;
			while (items.hasMoreElements()) {
				var file = items.getNext().QueryInterface(Components.interfaces.nsIFile);
				if (file.isFile()) {
					var splitedtmp = file.path.split('.');
					var FileType = splitedtmp[splitedtmp.length-1].toLowerCase();
					if (allowedFileType.indexOf(FileType) > -1) {
						FileArray.push(file);
					}
				}
			}
			document.getElementById("progresstext").value="( "+ 0 +" / "+ FileArray.length + " " +document.getElementById("bundle_addart").getString("images")+" )";
			if(FileArray.length==0){
				alert(document.getElementById("bundle_addart").getString("noimages"));
				document.getElementById("progressbox").style.visibility="hidden";
				document.getElementById("selectdir").style.visibility="visible";
				document.getElementById("btnOK").disabled = false;
				document.getElementById("NBlocal").value = addartOptions.NbImagesIn("local")+ " "+document.getElementById("bundle_addart").getString("imagesloaded");
			}
			else
				setTimeout(addartOptions.miniaturize,0,FileArray,allowedFileType,0);
		}
	},
	
	getImgUrlFromPage: function(page, reg) {
		var found = new Array();
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                    .createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.open('GET', page, false);
		req.send(null);
 		if (req.status == 200)
   			found = req.responseText.match(reg);
		return found;
	},
	
	ImportUrlIn: function(url, location , nb) {
		var ioserv = Components.classes["@mozilla.org/network/io-service;1"] 
  						 .getService(Components.interfaces.nsIIOService); 
 		var channel = ioserv.newChannel(url, 0, null); 
 		var stream = channel.open(); 
 		if (channel instanceof Components.interfaces.nsIHttpChannel && channel.responseStatus == 200) { 
			var bstream = Components.classes["@mozilla.org/binaryinputstream;1"] 
									.createInstance(Components.interfaces.nsIBinaryInputStream); 
			bstream.setInputStream(stream); 
			const id = "addart@tmathieu";
			var dir = Components.classes["@mozilla.org/extensions/manager;1"]
 	    						.getService(Components.interfaces.nsIExtensionManager)
	    						.getInstallLocation(id)
 	    						.getItemLocation(id);
			dir.append("chrome");
			dir.append("content");
			dir.append("AdChange_imgTmp");
			dir.append(location);
			dir.append("tempIMG.jpg");
			if(dir.exists())
				dir.remove(false);
			dir.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, 0664);
			var outstream = Components.classes["@mozilla.org/network/file-output-stream;1"]
										.createInstance(Components.interfaces.nsIFileOutputStream);
			outstream.init (dir, 0x04 | 0x08 | 0x20, 0600, 0);	
			var avail = bstream.available();
			while (avail) {
				outstream.write(bstream.readBytes(avail), avail);
				avail = bstream.available();
			}
			bstream.close();
			outstream.flush();
			outstream.close();
			
			var splitedtmp = dir.path.split('.');
			var FileType = splitedtmp[splitedtmp.length-1].toLowerCase();			
			var ms = Components.classes["@mozilla.org/mime;1"]
								.getService(Components.interfaces.nsIMIMEService);
			var intype = ms.getTypeFromFile(dir);
			var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]	
									.createInstance(Components.interfaces.nsIFileInputStream);
			stream.init(dir, 0x01, -1, null);
			var instream = Components.classes["@mozilla.org/network/buffered-input-stream;1"]
										.createInstance(Components.interfaces.nsIBufferedInputStream);	
			instream.init(stream, 1024);
			var obj = new Object();
			var IMG = Components.classes["@mozilla.org/image/tools;1"]
								.getService(Components.interfaces.imgITools);
			IMG.decodeImageData (instream, intype, obj); 
			var container = obj.value;
			instream.close();
			stream.close();
			var OrigH = container.height;
			var OrigW = container.width;
			var filename = nb + "_" + OrigH + "_" + OrigW + "."+FileType;
			dir.copyTo(dir.parent,filename);
			dir.remove(false);
		}	
	},
	
	miniaturize: function(FileArray,allowedFileType,j) {	
		file = FileArray[j];
			
		var splitedtmp = file.path.split('.');
		var FileType = splitedtmp[splitedtmp.length-1].toLowerCase();			
				
		var ms = Components.classes["@mozilla.org/mime;1"]
							.getService(Components.interfaces.nsIMIMEService);
		var intype = ms.getTypeFromFile(file);
					
		var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]	
							.createInstance(Components.interfaces.nsIFileInputStream);
		stream.init(file, 0x01, -1, null);
		var instream = Components.classes["@mozilla.org/network/buffered-input-stream;1"]
							.createInstance(Components.interfaces.nsIBufferedInputStream);	
		instream.init(stream, 1024);
		var obj = new Object();
		var IMG = Components.classes["@mozilla.org/image/tools;1"]
							.getService(Components.interfaces.imgITools);
		IMG.decodeImageData (instream, intype, obj); 
		var container = obj.value;
		
		instream.close();
			
		stream.close();
		var OrigH = container.height;
		var OrigW = container.width;
		var resizeCoef = Math.sqrt((480000/OrigH)/OrigW);	
		var height = Math.round(OrigH * resizeCoef);
		var width = Math.round(OrigW * resizeCoef);	
		
		const id = "addart@tmathieu";
		var dir = Components.classes["@mozilla.org/extensions/manager;1"]
    	            			.getService(Components.interfaces.nsIExtensionManager)
    	            			.getInstallLocation(id)
    	            			.getItemLocation(id);
		dir.append("chrome");
		dir.append("content");
		dir.append("AdChange_imgTmp");
		dir.append("local");
		
		var filename = j + "_" + height + "_" + width + "." + FileType;
		
		if(resizeCoef > 1 ) {
			file.copyTo(dir,filename);
		}
		else {
			dir.append(filename);
			dir.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, 0664);
			var stream = IMG.encodeScaledImage (container, intype, width, height);
			var encodedStream = Components.classes["@mozilla.org/binaryinputstream;1"]
						.createInstance(Components.interfaces.nsIBinaryInputStream);
			encodedStream.setInputStream(stream);
			
			var outstream = Components.classes["@mozilla.org/network/file-output-stream;1"]
						.createInstance(Components.interfaces.nsIFileOutputStream);
			outstream.init (dir, 0x04 | 0x08 | 0x20, 0600, 0);	
			var avail = encodedStream.available();
			while (avail) {
  					outstream.write(encodedStream.readBytes(avail), avail);
  					avail = encodedStream.available();
			}
			encodedStream.close();
			outstream.flush();
			outstream.close(); 		
		}
		var x= j+1;
		if(x<FileArray.length) {
			setTimeout(addartOptions.miniaturize,0,FileArray,allowedFileType,j+1);
			document.getElementById("progressbar").value = parseInt(x*100/FileArray.length);
			document.getElementById("progresstext").value="( "+ x +" / "+ FileArray.length + " " +document.getElementById("bundle_addart").getString("images")+" )";
		}
		else {
			document.getElementById("progresstext").value="( "+ x +" / "+ FileArray.length + " " +document.getElementById("bundle_addart").getString("images")+" )";
			AdChangeForAdBlockPlusComponent.setPref("addart.directory",document.getElementById("AC_Directory").value);
			alert(document.getElementById("bundle_addart").getString("endofloading.alert"));
			document.getElementById("progressbox").style.visibility="hidden";
			document.getElementById("selectdir").style.visibility="visible";
			document.getElementById("btnOK").disabled = false;
			document.getElementById("NBlocal").value = addartOptions.NbImagesIn("local")+ " "+document.getElementById("bundle_addart").getString("imagesloaded");
		}
	},
		
	deleteTMP: function(location) {
		const id = "addart@tmathieu";
		var dir = Components.classes["@mozilla.org/extensions/manager;1"]
	                   .getService(Components.interfaces.nsIExtensionManager)
	                   .getInstallLocation(id)
	                   .getItemLocation(id);	
	    dir.append("chrome");
		dir.append("content");
		dir.append("AdChange_imgTmp");
		dir.append(location);
		var items = dir.directoryEntries;
	 	while (items.hasMoreElements()) {
			var file = items.getNext().QueryInterface(Components.interfaces.nsIFile);
			if (file.isFile()) {
				file.remove(false);
			}
		}
	}
}