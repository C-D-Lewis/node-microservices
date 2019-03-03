import React from 'react';
import { Colors } from '../util';

const Icon = ({ src }) => {
  const style = {
    width: 50,
    height: 'auto',
  };

  return <img style={style} src={src}/>;
};

const Title = ({ children }) => {
  const style = {
    color: 'white',
    fontSize: '1.5rem',
    marginLeft: 15,
    fontWeight: 'bold',
  };

  return <div style={style}>{children}</div>;
};

const Content = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // flex: 1,
    paddingLeft: 35,
  };

  return <div style={style}>{children}</div>;
};

const NavBar  = ({ children, icon, title }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    minHeight: 65,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    boxShadow: '0px 2px 3px 1px #5557',
    paddingLeft: 20,
  };

  return (
    <div style={style}>
      <Icon src={icon}/>
      <Title>{title}</Title>
      <Content>{children}</Content>
    </div>
  );
};

export default NavBar;
