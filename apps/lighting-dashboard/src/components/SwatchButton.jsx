import React from 'react';
import { Colors } from '../theme';

const SwatchButton = ({ color, onClick }) =>
  <div style={{
    display: 'flex',
    minWidth: 30,
    height: 30,
    flex: 1,
    backgroundColor: color,
    margin: 3,
    borderRadius: 5,
    cursor: 'pointer',
  }}
  onClick={onClick} />;

export default SwatchButton;
