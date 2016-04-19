  var artAdder = {
    processAdNode : function (elem, exhibition, pieceI) {

      var goodBye = false
      if (elem.offsetWidth < 2) goodBye = true
      if (elem.offsetHeight < 2) goodBye = true
      if (elem.tagName !== 'IFRAME'
          && elem.tagName !== 'IMG'
          && elem.tagName !== 'DIV'
          && elem.tagName !== 'OBJECT'
          && elem.tagName !== 'A'
          && elem.tagName !== 'INS'
          ) goodBye = true

      if ($(elem).data('replaced')) goodBye = true
      $(elem).data('replaced', true)
      $(elem).parent().data('replaced', true) // just in case
      if (goodBye) return

      var origW = elem.offsetWidth
      var origH = elem.offsetHeight
      var piece = exhibition.works[pieceI]

      var $wrap = $('<div>').css({
        width: origW,
        height: origH,
        position : 'relative'
      })
      var art  = document.createElement('a')
      art.href = piece.link || exhibition.link || 'http://add-art.org'
      art.title = piece.title || exhibition.title + ' | replaced by Add-Art'
      art.target = '_blank'
      art.style.width = origW + 'px'
      art.style.height = origH + 'px'
      art.style.display = 'block'
      art.style.position = 'absolute'
      art.style.background = "url(" + piece.image + ")"
      art.style.backgroundSize = "cover"
      art.style.backgroundPosition = "left " + ['top', 'bottom', 'center'][( Math.floor(Math.random() * 3) )]
      art.style.backgroundRepeat = "no-repeat"

      $wrap.append(art)
      $(elem.parentElement).append($wrap)
      $(elem).remove()

    }
}

