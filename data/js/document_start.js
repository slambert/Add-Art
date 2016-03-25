$(function (){
  var MAX_WIDTH = 728
  var MAX_HEIGHT = 600 

  function checkElem ($elem) {
    if ($elem.innerWidth() > 50 && $elem.innerHeight() > 50) {
      return $elem
    }
  }

  function findFirstWithDims ($elem) {
    if (checkElem($elem)) return $elem
    var par = $elem.parent()
    if (checkElem(par)) return par
    return findFirstWithDims(par)
  }

  // catch simple google ads 
  $('script[src*=googlesyndication]').each(function (){
    // try to find dimensions
    var w, h

    // google ad convention
    var prev = $(this).prev()
    if (prev.is('script')) {
      w = prev.html().match(/google_ad_width[^0-9;]+([0-9]+);/)[1]
      h = prev.html().match(/google_ad_height[^0-9;]+([0-9]+);/)[1]
    }
    // or, determine the space I'm in
    if (!(w && h)) {
      var par = findFirstWithDims($(this))
        console.log(par)
      w = par.innerWidth()
      h = par.innerHeight()
      console.log(w)
      console.log(h)
    }
    if (w > MAX_WIDTH) w = MAX_WIDTH
    if (h > MAX_HEIGHT) h = MAX_HEIGHT

    // this tag will get caught by the document_end script
    var add = $('<ins>').addClass('addendum').css({ width : w, height : h, display : 'inline-block' })
    $(this).after(add).remove()
  })
})
