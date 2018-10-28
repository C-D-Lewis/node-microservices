import React from 'react';

class NavBar extends React.Component {
  
  render() {
    return (
      <div className="navbar">
        <img className="navbar-icon" src={this.props.icon}/>
        <div className="navbar-title">{this.props.title}</div>
        {this.props.children}
      </div>
    );
  }
  
}

export default NavBar;
