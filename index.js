const {XMLHttpRequest} = require("sdk/net/xhr")
const { defer } = require('sdk/core/promise')
var ss = require("sdk/simple-storage")
var pageMod = require("sdk/page-mod")
var data = require("sdk/self").data
var tabs = require('sdk/tabs')
var { ToggleButton } = require('sdk/ui/button/toggle')
var panels = require("sdk/panel")
var self = require("sdk/self")
var tabs = require("sdk/tabs")
var R = require('ramda')
var helpers = require('./src/addArtHelpers.js')


var lastUrl,
    currentPieceI,
    selectors = false
function resetPieceI (){
  lastUrl = false
  currentPieceI = -1
}
resetPieceI()

function fetch (url, txt) {
  var d = defer()
  var xhr = new XMLHttpRequest()
  xhr.onload = function (){
    d.resolve(txt ? xhr.responseText : JSON.parse(xhr.responseText))
  }
  xhr.onerror = function (evt){
    d.reject(evt)
  }
  xhr.open('GET', url, true)
  xhr.send(null)
  return d.promise
}

fetch( "https://raw.githubusercontent.com/owise1/addendum-exhibitions/master/exhibitions.json")
.then(function (res){
  ss.storage.exhibitions = res.sort(helpers.exhibitionsSort)
  if (!ss.storage.disableAutoUpdate) {
    ss.storage.currentExhibition = ss.storage.exhibitions[0].title
  }
  return fetch('https://easylist-downloads.adblockplus.org/easylist.txt', true)
})
.then(function (txt) {
  selectors = txt.split("\n")
        .reverse()
        .filter(function name(line) {
          return /^##/.test(line)
        })
        .map(function (line) {
          return line.replace(/^##/, '')
        })
  go()
}, go)

function getCurrentExhibition (){
  return R.find(R.propEq('title', ss.storage.currentExhibition), ss.storage.exhibitions)
}

function communication (worker){
  worker.port.on('exhibition', function() {
    worker.port.emit('exhibition', {
      exhibition : getCurrentExhibition(),
      pieceI : getPieceI(),
      selectors : selectors
    })
  })
  function emitExhibitions (){
    var exhibitions = R.map(helpers.addPropToObj('addendum', true), ss.storage.exhibitions)
    if (ss.storage.customExhibitions) {
      exhibitions = exhibitions.concat(ss.storage.customExhibitions).sort(helpers.exhibitionsSort)
    }
    worker.port.emit('exhibitions', {
      exhibitions : exhibitions,
      currentExhibition : ss.storage.currentExhibition,
      disableAutoUpdate : ss.storage.disableAutoUpdate
    })
  }
  worker.port.on('exhibitions',emitExhibitions)

  worker.port.on('disableAutoUpdate', function(state) {
    ss.storage.disableAutoUpdate = state
  })
  worker.port.on('setExhibition', function(title) {
    for (var i in ss.storage.exhibitions) {
      if (ss.storage.exhibitions[i].title === title) {
        ss.storage.currentExhibition = title
        resetPieceI()
      }
    }
    emitExhibitions()
  })
  worker.port.on('fetchExhibition', function (url) {
    fetch(url)
    .then(function (exhibition){
      if (helpers.verifyExhibition(exhibition)) {
        var exhibs = ss.storage.customExhibitions || []
        exhibition.url = url  // save for later
        exhibs.push(exhibition)
        ss.storage.customExhibitions = exhibs.sort(helpers.exhibitionsSort)
        ss.storage.currentExhibition = exhibition.title
        worker.port.emit('exhibitionError', false)
        emitExhibitions()
      } else {
        worker.port.emit('exhibitionError', true)
      }
    })
  })
}


// rotate through pieces
// each webpage shows a single image
function getPieceI() {
  if (tabs.activeTab.url !== lastUrl) {
    lastUrl = tabs.activeTab.url
    currentPieceI++
  }
  if (currentPieceI > getCurrentExhibition().works.length - 1) {
    currentPieceI = 0
  }
  return currentPieceI
}

function go(){
  // on end
  pageMod.PageMod({
    include: "*",
    contentScriptFile: [data.url("js/lib/jquery-1.11.2.min.js"),
                        data.url("js/artAdder.js"),
                        data.url("js/document_end.js")],
    onAttach : communication
  })

  // on ready
  // pageMod.PageMod({
  //   include: "*",
  //   contentScriptFile: [data.url("js/lib/jquery-1.11.2.min.js"),
  //                       data.url("js/document_start.js")],
  //   contentScriptWhen : 'ready'
  // })

  // popup
  var panel,button

  panel = panels.Panel({
    contentURL: self.data.url("popup.html"),
    onHide: function (){
      button.state('window', {checked: false})
    }
  })
  communication(panel)

  button = ToggleButton({
    id: "my-button",
    label: "Add-Art",
    icon: {
      "16": "./images/icon-16.png",
      "32": "./images/icon-32.png",
      "64": "./images/icon-64.png"
    },
    onChange: function (state) {
      if (state.checked) {
        panel.show({
          position: button
        })
      }
    }
  })

  // installed for the first time?
  if (!ss.storage.lastOpen) {
    ss.storage.lastOpen = Date.now()
    tabs.open('http://add-art.org/update')
  }

}

