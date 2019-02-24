import React from 'react';

const TextButton = ({ label, onClick }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100px',
    height: '30px',
    color: 'black',
    backgroundColor: '#DDD',
    padding: '5px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    textAlign: 'center',
    justifyContent: 'center',
  };

  return  <div style={style} onClick={onClick}>{label}</div>;
};

export default TextButton;
