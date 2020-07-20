import React from 'react';
import { Colors } from '../theme';

const NavbarIcon = ({ src }) =>
  <img style={{
    width: 50,
    height: 50,
    marginLeft: 20,
  }}
  src={src}/>;

const NavbarTitle = ({ children }) =>
  <div style={{
    color: 'white',
    fontSize: '1.5rem',
    marginLeft: 15,
    fontWeight: 'bold',
  }}>
    {children}
  </div>;

const NavbarContent = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 35,
  }}>
    {children}
  </div>;

const NavBar  = ({ children, icon, title }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 0,
    width: '100vw',
    minHeight: 65,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    boxShadow: '0px 2px 3px 1px #5557',
  }}>
    <NavbarIcon src={icon}/>
    <NavbarTitle>{title}</NavbarTitle>
    <NavbarContent>{children}</NavbarContent>
  </div>;

export default NavBar;
