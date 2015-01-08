var ss = require("sdk/simple-storage");

if(!ss.storage.defaultShows) {
	ss.storage.defaultShows = [
		'http://add-art.org/category/eyebeam/feed/',
		'http://add-art.org/category/rhizome/feed/',
		'http://add-art.org/category/brooklyn-museum/feed/',
		'http://add-art.org/category/kadist/feed/'
	];
}
var defaultShows = ss.storage.defaultShows;
var showList = document.getElementById("#shows");
self.port.on("show", function onShow() {
  for(var i = 0; i < defaultShows.length; i++) {
  	console.log(defaultShows[i]);
  }
});

var body = document.getElementsByTagName("body")[0];
body.addEventListener('keyup', function onkeyup(event) {
  if (event.keyCode == 13) {
    self.port.emit("save", text);
  }
}, false);