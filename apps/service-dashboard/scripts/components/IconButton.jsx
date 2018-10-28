import React from 'react';

class IconButton extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.onClick = this.onClick.bind(this);
  }

  render() {
    const { borderColor } = this.props;
    return (
      <img className="icon-button" src={this.props.iconSrc} style={{ borderColor }}
        onClick={this.onClick}/>
    );
  }
  
  onClick() {
    this.props.onClick();
  }
  
}

export default IconButton;
