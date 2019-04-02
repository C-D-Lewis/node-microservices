import React from 'react';
import { Colors } from '../util';

const TextButton = ({ label, restyle, onClick }) => {
  const style = Object.assign({
    display: 'flex',
    flexDirection: 'column',
    height: '30px',
    backgroundColor: Colors.primary,
    color: 'white',
    padding: '5px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    textAlign: 'center',
    justifyContent: 'center',
    borderLeft: '1px solid #FFF4',
    borderRight: '1px solid #FFF4',
  }, restyle);

  return  <div style={style} onClick={onClick}>{label}</div>;
};

export default TextButton;
