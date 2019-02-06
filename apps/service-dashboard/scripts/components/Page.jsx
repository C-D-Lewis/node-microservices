import React from 'react';
import { Colors } from '../util';

const Page = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGrey,
  };

  return <div style={style}>{children}</div>;
};
  
export default Page;
