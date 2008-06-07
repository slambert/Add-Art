(function() {
  var getArtFrameHTML = function(width, height, additional) {
    if (typeof additional == "undefined")
      additional = "";

    return '<div class="{{SEED}}" width="' + width + '" height="' + height + '" ' + additional + '></div>';
  }

  var writeArtFrame = function(width, height, additional) {
    document.write(getArtFrameHTML(width, height, additional));
  }

  var insertArtFrame = function(element, width, height, additional) {
    element.innerHTML = getArtFrameHTML(width, height, additional);
  }

  try {
    {{SCRIPT}}
  } catch(e) {}
})()

