var R = require('ramda')

var addArtHelpers = {
  formatDate : function (date) {
    var dateObj = new Date(parseInt(date))
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    var day = dateObj.getDate()
    var month = months[dateObj.getMonth()]
    var year = dateObj.getUTCFullYear()
    return month + ' ' + day + ', ' + year
  },
  verifyExhibition : function (exhib){
    return ['artist','description','title','thumbnail','works'].reduce(function (prev, curr){
      if (!prev) return prev 
      return exhib[curr] !== undefined
    }, true)
  },
  exhibitionsSort : function (a,b) {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1
    return 0
  },
  addPropToObj : R.curry(function (prop, fn){
    return function (obj) {
      return R.set(R.lensProp(prop), typeof fn === 'function' ? fn(obj) : fn, R.clone(obj))
    }
  })
}
module.exports = addArtHelpers
