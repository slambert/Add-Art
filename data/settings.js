self.port.on("show", function onShow() {
	
});

self.port.on("addSubscriptions", function buildInterface(shows) {
	console.log(shows);
	// for(var i = 0; i < shows.length; i++) {
	// 	var show = shows[i];
	// 	console.log(show[i]);
	// 	$('#shows').append('<li>'+ show.title +'</li>').addClass(show.title);
	// 	// var show = shows[i].url;
	// 	// $('#shows').append('<li></li>');
	//  //   	$('#shows li').eq(i).append(show);
	// }
});