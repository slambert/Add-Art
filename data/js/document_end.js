jQuery(function ($){
  self.port.emit('exhibition')
  self.port.on('exhibition', function(exhibition) {
    var howMany = 3
    var tried = 0
    ;(function checkIFrames() {
      var selectors = exhibition.selectors || [
        'div[id^=google_ads]',
        'iframe[id^=google_ads]',
        'iframe[src*=serving-sys]',
        'ins.adsbygoogle',
        'ins.addendum',
        'ins[id^=aswift]',
        'img[src*=decknetwork]'
      ]
      $(selectors.join(',')).each(function (){
        artAdder.processAdNode(this, exhibition.exhibition, exhibition.pieceI)
      })
      if (++tried < howMany) {
        setTimeout(checkIFrames, 3000)
      }
    })()
  })
})
