self.port.on("show", function onShow() {
	
});
var subscriptions = [];
self.port.on("addSubscriptions", function(shows,count) {
	subscriptions.push(shows);
	if(subscriptions.length == count) {
		buildInterface(subscriptions);
	}
});

function buildInterface(subs) {
	var $shows = $('ul#shows');
	var $showTemplate = $('ul#shows li.show');
	for(var i = 0; i < subs.length; i++) {
		addSub(subs[i],i);
		if(i!=subs.length-1) $shows.append($showTemplate.clone());
	}
}

function addSub(show,i) {
	var $row = $('ul#shows li.show').eq(i);
	$row.find('h1.title').html(show.title);
	$row.find('.date').html('Last updated on '+ show.date );
	$row.find('img.thumb').attr('src', show.thumbnail);
	// var info = {
	// 	title : show.title,
	// 	date : show.date,
	// 	description : show.description,
	// 	thumbnail : show.thumbnail,
	// 	link : show.link,
	// 	url : show.url
	// };

	// for(var i = 0; i < info.length; i++) {
	// 	list.append(item);
	// }
}


