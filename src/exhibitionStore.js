const Reflux = require('reflux')
const ExhibitionActions = require('./exhibitionActions.js')

const ExhibitionStore = Reflux.createStore({
  listenables : [ExhibitionActions],
  state : {
    exhibitions : [],
    currentExhibition : '',
    chosen : '',
    disableAutoUpdate : false,
    addSource  : false,
    exhibitionError : false
  },
  init : function (){
    var _this = this
    this.addon = typeof addon === 'undefined' ? require('./mockAddon.js') : addon

    this.addon.port.on('exhibitions', function(exhibitions) {
      console.log(exhibitions);
      _this.state.currentExhibition = exhibitions.currentExhibition
      _this.state.exhibitions = exhibitions.exhibitions
      _this.state.disableAutoUpdate = exhibitions.disableAutoUpdate
      _this._t()
    })
    this.addon.port.on('exhibitionError', function(err) {
      _this.state.exhibitionError = err
      // sent when a new exhibition is added
      if (!err) {
        _this.state.addSource = false
      }
      _this._t()
    })
    _this.trigger(_this.state)

    this.getExhibitions()
  },
  _t : function (){
    this.trigger(this.state)
  },
  getInitialState : function (){
    return this.state
  },
  toggleAutoUpdate : function (){
    this.state.disableAutoUpdate = !this.state.disableAutoUpdate
    this.addon.port.emit('disableAutoUpdate', !this.state.disableAutoUpdate)
    this._t()
  },
  toggleSource : function () {
    this.state.addSource = !this.state.addSource
    this._t()
  },
  close : function (){
    this.state.addSource = false
    this.openExhibition('')
  },
  addCustomExhibition : function (url) {
    this.addon.port.emit('fetchExhibition', url)
  },
  openExhibition : function (what){
    this.state.chosen = what
    this._t()
  },
  getExhibitions : function (){
    this.addon.port.emit('exhibitions')
  },
  setExhibition : function (title){
    this.addon.port.emit('setExhibition', title)
    this.state.chosen = ''
    this.state.currentExhibition = title 
    this._t()
  }

})

module.exports = ExhibitionStore
