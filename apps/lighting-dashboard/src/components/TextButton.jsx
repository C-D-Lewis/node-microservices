import React from 'react';
import { Colors } from '../theme';

const TextButton = ({ label, style, onClick }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    height: 30,
    backgroundColor: Colors.primary,
    color: 'white',
    padding: 5,
    margin: 10,
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: '1.1rem',
    textAlign: 'center',
    justifyContent: 'center',
    ...style,
  }}
  onClick={onClick}>
    {label}
  </div>;

export default TextButton;
