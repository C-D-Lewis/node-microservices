import React from 'react';
import { BOTTOM_BAR_HEIGHT, Colors } from '../util';

const Page = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingBottom: BOTTOM_BAR_HEIGHT,
  };

  return <div style={style}>{children}</div>;
};
  
export default Page;
