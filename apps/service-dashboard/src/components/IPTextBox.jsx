import React from 'react';

class IPTextBox extends React.Component {

  render() {
    const style = {
      width: '200px',
      height: '30px',
      border: 0,
      backgroundColor: '#0003',
      margin: '10px',
      color: 'white',
      fontSize: '1.1rem',
      paddingLeft: '5px',
    };

    return (
      <input id="ip-text-box" style={style} type="text" value={this.props.ip}
        onChange={el => this.props.onChange(el.target.value)}/>
    );
  }

}

export default IPTextBox;
