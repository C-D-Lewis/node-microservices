import React from 'react';

class AppMenuItem extends React.Component {
  
  render() {
    const ok = this.props.data.status === 'OK';
    const statusLedClasses = `status-led status-led-${ok ? 'ok' : 'down'}`;
    const menuItemClasses = `app-menu-item ${this.props.selected ? 'app-menu-item-selected': ''}`;
    
    return (
      <div className={menuItemClasses} onClick={this.props.onClick}>
        <div className={statusLedClasses}/>
        {this.props.data.app}
      </div>
    );
  }
  
}

export default AppMenuItem;
