import React from 'react';

// TODO: Can be consolidated with IPTextBox

const TokenTextBox = ({ value, onChange }) =>
  <input
    style={{
      width: '385px',
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
    placeholder="Enter token..."
    onChange={event => onChange(event.target.value)}/>;

export default TokenTextBox;
