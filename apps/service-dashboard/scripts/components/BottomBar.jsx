import React from 'react';

class BottomBar extends React.Component {

  render() {
    return (
      <div className="bottom-bar">{this.props.state.lastResponse}</div>
    );
  }

}

export default BottomBar;
