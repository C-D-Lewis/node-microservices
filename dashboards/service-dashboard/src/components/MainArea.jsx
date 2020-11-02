import React from 'react';
import { BOTTOM_BAR_HEIGHT } from './BottomBar';

const MainArea = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    flex: 5,
    flexWrap: 'wrap',
    width: '100%',
    paddingTop: '10px',
    paddingBottom: 2 * BOTTOM_BAR_HEIGHT,
    alignItems: 'flex-start',
  }}>
    {children}
  </div>;

export default MainArea;
