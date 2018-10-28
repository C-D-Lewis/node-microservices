import React from 'react';

export class FlexColumn extends React.Component {
  
  render() {
    return (
      <div className="flex-column">{this.props.children}</div>
    );
  }
  
}

export class FlexRow extends React.Component {
  
  render() {
    return (
      <div className="flex-row">{this.props.children}</div>
    );
  }
  
}
