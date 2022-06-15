import React from 'react';
import { BOTTOM_BAR_HEIGHT } from './ResponseBar';

const MainArea = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    flex: 5,
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    alignItems: 'flex-start',
  }}>
    {children}
  </div>;

export default MainArea;
