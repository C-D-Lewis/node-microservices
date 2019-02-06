import React from 'react';
import { Colors } from '../util';

const Icon = ({ src }) => {
  const style = {
    width: '40px',
    height: 'auto',
    marginLeft: '10px',
  };

  return <img style={style} src={src}/>;
};

const Title = ({ children }) => {
  const style = {
    color: 'white',
    fontSize: '1.5rem',
    marginLeft: '10px',
    fontWeight: 'bold',
  };

  return <div style={style}>{children}</div>;
};

const NavBar  = ({ children, icon, title }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '60px',
    backgroundColor: Colors.main,
    alignItems: 'center',
    borderBottom: 'solid 3px #0004',
  };

  return (
    <div style={style}>
      <Icon src={icon}/>
      <Title>{title}</Title>
    </div>
  );
};
  
export default NavBar;
