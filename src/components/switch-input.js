const React = require('react')

module.exports = React.createClass({
  render : function (){
    return (
        <a id="check" onClick={this.props.onClick} title="Click to disable for this website" className={ !this.props.on ? 'off' : ''}></a>
    )
  },
})
