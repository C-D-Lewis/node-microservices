import React from 'react';

const IconButton = ({ iconSrc, onClick }) => {
  const style = {
    width: '26px',
    height: '26px',
    backgroundColor: '#0003',
    padding: '3px',
    borderRadius: '3px',
    marginRight: '5px',
    cursor: 'pointer',
  };

  return  <img style={style} src={iconSrc} onClick={onClick}/>;
};

export default IconButton;
