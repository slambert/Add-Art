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
      var host = R.path(['location', 'host'],parent)
      var skips = []
      if (host) {
        skips = exhibition.whitelist
          .filter(R.pipe(R.nth(0), R.split(','), R.contains(host.replace('www.', ''))))
          .map(R.nth(1))
      }
      $(selectors.join(',')).each(function (){
        var $this = $(this)
        var successfulSkips = skips.filter(function (sel){
          return $this.is(sel)
        })
        if (successfulSkips.length > 0) {
          return
        }
        artAdder.processAdNode(this, exhibition.exhibition, exhibition.pieceI)
      })
      if (++tried < howMany) {
        setTimeout(checkIFrames, 3000)
      }
    })()
  })
})
