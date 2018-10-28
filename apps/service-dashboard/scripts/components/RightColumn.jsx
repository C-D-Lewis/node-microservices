import React from 'react';

class RightColumn extends React.Component {
  
  render() {
    return (
      <div className="right-column">{this.props.children}</div>
    );
  }
  
}

export default RightColumn;
