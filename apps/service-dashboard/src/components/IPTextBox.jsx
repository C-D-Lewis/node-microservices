import React from 'react';

const IPTextBox = ({ ip, onChange }) => {
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
    <input id="ip-text-box" style={style} type="text" value={ip}
      onChange={el => onChange(el.target.value)}/>
  );
};

export default IPTextBox;
