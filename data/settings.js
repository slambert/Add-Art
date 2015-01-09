self.port.on("show", function onShow() {
	var ss = require("sdk/simple-storage");
	// if(!ss.storage.defaultShows) {
		ss.storage.defaultShows = [
		// var defaultShows = [ 
			'http://add-art.org/category/eyebeam/feed/',
			'http://add-art.org/category/rhizome/feed/',
			'http://add-art.org/category/brooklyn-museum/feed/',
			'http://add-art.org/category/kadist/feed/',
			'http://add-art.org/category/nasa/feed/'
		];
	// }
	var defaultShows = ss.storage.defaultShows;
	$('body').html(defaultShows[0]);
	// var showList = document.getElementById("#shows");
	// self.port.on("show", function onShow() {
	//   for(var i = 0; i < defaultShows.length; i++) {
	//   	console.log(defaultShows[i]);
	//   }
	// });
});