import React from 'react';

const TextBox  = ({ value, onChange, placeholder = '', style }) =>
  <input type="text" style={{
    height: '30px',
    border: '0',
    borderBottom: '2px solid #0005',
    color: 'black',
    fontSize: '1.1rem',
    paddingLeft: '5px',
    margin: '0px 10px 10px 0px',
    ...style,
  }}
  value={value}
  placeholder={placeholder}
  onChange={el => onChange(el.target.value)}/>;

export default TextBox;
