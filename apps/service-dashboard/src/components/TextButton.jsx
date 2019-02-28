import React from 'react';
import { Colors } from '../util';

const TextButton = ({ label, restyle, onClick }) => {
  const style = Object.assign({
    display: 'flex',
    flexDirection: 'column',
    minWidth: '50px',
    height: '30px',
    backgroundColor: Colors.primary,
    color: 'white',
    padding: '5px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    textAlign: 'center',
    justifyContent: 'center',
    margin: '0px 2px',
    // boxShadow: `0px 4px 0px 0px ${Colors.primaryDark}`
  }, restyle);

  return  <div style={style} onClick={onClick}>{label}</div>;
};

export default TextButton;
