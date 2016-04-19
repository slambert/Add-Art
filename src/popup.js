// main.js
const React = require('react')
const ReactDOM = require('react-dom')
const Reflux = require('reflux')
const ExhibitionActions = require('./exhibitionActions.js')
const ExhibitionStore = require('./exhibitionStore.js')
const helpers = require('./addArtHelpers.js')



var ExhibitionThumb = React.createClass({
  render : function (){
    btnClass = 'show'
    if (this.props.active) btnClass += ' active'
    if (this.props.exhibition.addendum) btnClass += ' addendum'
    return (
        <li className={btnClass}>
          <a onClick={this.chooseMe} >
          <div className="active"></div>
          <div className="content">
            <div className="thumb">
              <img src={ this.props.exhibition.thumbnail }/>
              <div className="short-title">{ this.props.title }</div>
            </div>
          </div>
          </a>
        </li>
    )
  },
  chooseMe : function (){
    ExhibitionActions.openExhibition(this.props.exhibition.title)
  }
})

var ExhibitionList = ({ exhibitions, currentExhibition }) => {
    var thumbs = ''
    if (exhibitions) {
      var totalAddendums = exhibitions.reduce(function (prev, curr){
        if (curr.addendum) return prev + 1
        return prev
      }, 0)
      thumbs = exhibitions.map(function (exhibition){
        var title = exhibition.title
        if (exhibition.addendum) {
          title = 'Addendum #' + totalAddendums--
        }
        return (
            <ExhibitionThumb 
              active={currentExhibition === exhibition.title} 
              key={exhibition.title} 
              exhibition={exhibition}
              title={title}
            />
        )
      })
    }
    return (
      <section id="squares">
        <ul id="shows">
          {thumbs}
        </ul>
      </section>
    )
}

var ExhibitionInfo = React.createClass({
  render : function (){
    var className = 'infoPage',
        linkHtml = '',
        exhib = this.props.exhibition,
        description = exhib.description
    if (this.props.open) className += ' opened'
    if (this.props.exhibition.link) linkHtml = <div className="link"><a href={this.props.exhibition.link}>{this.props.exhibition.link.replace('http://','')}</a></div>
    if (!exhib.addendum && exhib.url) description += "\n\nEssay URL:\n" + exhib.url
    return (
      <div className={className}>
        <div className="inner">
          <header>
            <h1 className="title">{this.props.exhibition.title}</h1>
            <div className="date">{helpers.formatDate(this.props.exhibition.date)}</div>
            {linkHtml}
          </header>
          <div className="description">{description}</div>
        </div>
        <div onClick={this.chooseMe} className="selectSource">
          <span className="vert-align">ADD THIS ART</span>
        </div>
      </div>
    )
  },
  chooseMe : function (){
    ExhibitionActions.setExhibition(this.props.exhibition.title)
  }
})

var NewSourceView = React.createClass({
  getInitialState : function (){
    return { url : '' }
  },
  handleUrlChange : function (evt){
    this.setState({ url : evt.target.value })
  },
  submit : function (){
    ExhibitionActions.addCustomExhibition(this.state.url)
    this.state.url = ''
  },
  render : function () {
    var addSourceClass = '', errorMsg = ''
    if (this.props.store.addSource) {
      addSourceClass = 'opened'
    }
    if (this.props.store.exhibitionError) {
      errorMsg = 'Sorry, there was a problem with that URL'
    }
    return  (
      <section id="newSource" className={addSourceClass}>
        <div className="horz-align">
          <div className="vert-align">
            <input type="text" placeholder="Essay URL" onChange={this.handleUrlChange} value={this.state.url} />
            <div id="addNewSource" onClick={this.submit}></div>
            <div className="clear"></div>
            <p className="errors">{errorMsg}</p>
            <p>
              Create your own essay on <a href="http://add-art.org/essays/" target="_blank">add-art.org</a>
            </p>
          </div>
        </div>
      </section>
    )
  }
})

var AddArtPopup = React.createClass({
  mixins : [Reflux.connect(ExhibitionStore, 'exhibitionStore')],
  render : function (){
    var infos = ''
    var closeClass = '', addSourceClass = ''
    var store = this.state.exhibitionStore
    if (store.exhibitions) {
      var _this = this
      infos = store.exhibitions.map(function (exhibition){
        return (
            <ExhibitionInfo open={exhibition.title === _this.state.exhibitionStore.chosen} exhibition={exhibition} key={exhibition.title} />
        )
      })
    }
    if (store.chosen && store.chosen !== '') {
      closeClass = 'visible'
    }
    if (store.addSource) {
      closeClass = 'visible'
    }
    return (
      <div>
        <header id="top">
          <div onClick={ExhibitionActions.toggleSource} title="Add your own art show" id="addSource"></div>
          <div id="close" className={closeClass} onClick={ExhibitionActions.close}></div>
        </header>
        <div>
          {infos}
          <ExhibitionList exhibitions={store.exhibitions} currentExhibition={store.currentExhibition} />
          <div className="autoUpdate">
            <label>Keep up with the latest exhibitions? <input type='checkbox' checked={!store.disableAutoUpdate} onChange={ExhibitionActions.toggleAutoUpdate} name="autoUpdate" /></label>
          </div>
        </div>
        <NewSourceView store={store} />
      </div>
    )
  }
})

ReactDOM.render(
  <AddArtPopup />
  ,
  document.getElementById('main')
)
