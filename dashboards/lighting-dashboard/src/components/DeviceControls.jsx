import React, { useState, useEffect } from 'react';
import { Colors, Fonts } from '../theme';
import { sendDevicePacket } from '../services/apiService';
import TextButton from './TextButton';
import SwatchButton from './SwatchButton';

const DEMO_COLORS = [
  [255, 0, 0],    // Red
  [255, 127, 0],  // Orange
  [255, 255, 0],  // Yellow
  [127, 255, 0],  // Lime green
  [0, 255, 0],    // Green
  [0, 255, 127],  // Pastel green
  [0, 255, 255],  // Cyan
  [0, 127, 255],  // Sky blue
  [0, 0, 255],    // Blue
  [127, 0, 255],  // Purple
  [255, 0, 255],  // Pink
  [255, 0, 127],  // Hot pink
];

const Row = ({ children, align }) =>
  <div style={{
    display: 'flex',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
    padding: '0px 10px',
  }}>
    {children}
  </div>;

const ButtonBar = ({ children, align, style }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    margin: 7,
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
    ...style,
  }}>
    {children}
  </div>;

const Column = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }}>
    {children}
  </div>;

const Controls = ({ device }) => {
  const buttonStyle = { flex: 1 };

  const row1 = DEMO_COLORS.slice(0, 5);
  const row2 = DEMO_COLORS.slice(6, 11);

  return (
    <Column>
      <ButtonBar style={{ marginLeft: 10, marginRight: 10 }}>
        {row1.map(p => (
          <SwatchButton
            color={`rgb(${p[0]},${p[1]},${p[2]}`}
            onClick={() => {
              const message = { all: p };
              sendDevicePacket(device, { to: 'ambience', topic: 'set', message });
            }}/>
        ))}
      </ButtonBar>
      <ButtonBar style={{ marginLeft: 10, marginRight: 10 }}>
        {row2.map(p => (
          <SwatchButton
            color={`rgb(${p[0]},${p[1]},${p[2]}`}
            onClick={() => {
              const message = { all: p };
              sendDevicePacket(device, { to: 'ambience', topic: 'set', message });
            }}/>
        ))}
      </ButtonBar>
      <ButtonBar>
        <TextButton label="Off"
          style={{ ...buttonStyle, backgroundColor: 'black' }}
          onClick={() => sendDevicePacket(device, { to: 'ambience', topic: 'off' })}/>
        <TextButton label="Spotify"
          style={{ ...buttonStyle, backgroundColor: '#1DB954' }}
          onClick={() => sendDevicePacket(device, { to: 'ambience', topic: 'spotify' })}/>
        <TextButton label="Demo"
          style={buttonStyle}
          onClick={() => sendDevicePacket(device, { to: 'ambience', topic: 'demo' })}/>
        <TextButton label="Night"
          style={{ ...buttonStyle, backgroundColor: '#aaa', color: 'black' }}
          onClick={() => {
            const message = { all: [64, 64, 64 ] };
            sendDevicePacket(device, { to: 'ambience', topic: 'set', message });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const DeviceControls = ({ device }) => <Controls device={device} />

export default DeviceControls;
