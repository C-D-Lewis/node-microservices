import React from 'react';

const IPTextBox = ({ value, onChange }) =>
  <input
    style={{
      width: '200px',
      height: '30px',
      border: 0,
      backgroundColor: '#0003',
      margin: '10px',
      color: 'white',
      fontSize: '1.1rem',
      paddingLeft: '5px',
    }}
    type="text"
    value={value}
    onChange={event => onChange(event.target.value)}/>;

export default IPTextBox;
