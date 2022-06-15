import React from 'react';
import Container from './Container';

/** Height of the bottom status bar */
export const BOTTOM_BAR_HEIGHT = 30;

export const ResponseBar = ({ children }) =>
  <Container style={{
    fontFamily: 'monospace',
    position: 'relative',
    bottom: 0,
    width: '100%',
    minHeight: BOTTOM_BAR_HEIGHT,
    padding: '5px',
    backgroundColor: '#333',
    color: 'white',
    alignItems: 'center',
  }}>
    {children}
  </Container>;
