import React from 'react';
import { Colors } from '../theme';

const NavbarIcon = ({ src }) =>
  <img style={{
    width: 50,
    height: 'auto',
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
    flexWrap: 'wrap',
    width: '100%',
    minHeight: 65,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    boxShadow: '0px 2px 3px 1px #5557',
    paddingLeft: 20,
    zIndex: 999,
  }}>
    <NavbarIcon src={icon}/>
    <NavbarTitle>{title}</NavbarTitle>
    <NavbarContent>{children}</NavbarContent>
  </div>;

export default NavBar;
