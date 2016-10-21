const React = require('react')

module.exports = React.createClass({
  render : function (){
    let className = '',
        title = 'Click to disable add-art on this website'
    if (!this.props.on) {
      className = 'off'
      title = 'Click to enable add-art for this website'
    }
    return (
        <a id="check" onClick={this.props.onClick} title={title} className={className}></a>
    )
  },
})
