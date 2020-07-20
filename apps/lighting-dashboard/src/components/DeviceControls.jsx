import React from 'react';
import { Colors, Fonts } from '../theme';
import { sendDevicePacket } from '../services/apiService';
import TextButton from './TextButton';

const Row = ({ children, align }) =>
  <div style={{
    display: 'flex',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
    padding: '0px 10px',
  }}>
    {children}
  </div>;

const ButtonBar = ({ children, align }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
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

  // TODO Set/Fade swatches as rows

  return (
    <Column>
      <ButtonBar>
        <TextButton label="Off"
          style={buttonStyle}
          onClick={() => sendDevicePacket(device, { to: 'ambience', topic: 'off' })}/>
        <TextButton label="Spotify"
          style={buttonStyle}
          onClick={() => sendDevicePacket(device, { to: 'ambience', topic: 'spotify' })}/>
        <TextButton label="Demo"
          style={buttonStyle}
          onClick={() => sendDevicePacket(device, { to: 'ambience', topic: 'demo' })}/>
        {/* <TextButton label="Set" */}
        {/*   style={buttonStyle} */}
        {/*   onClick={() => { */}
        {/*     const { red, green, blue } = ambienceData; */}
        {/*     const message = { all: [red, green, blue] }; */}
        {/*     sendDevicePacket(device, { to: 'ambience', topic: 'set', message }); */}
        {/*   }}/> */}
        {/* <TextButton label="Fade" */}
        {/*   style={{ width: '20%', borderBottomRightRadius: 3 }} */}
        {/*   onClick={() => { */}
        {/*     const { red, green, blue } = ambienceData; */}
        {/*     const message = { all: [red, green, blue] }; */}
        {/*     sendDevicePacket(device, { to: 'ambience', topic: 'fade', message }); */}
        {/*   }}/> */}
      </ButtonBar>
    </Column>
  );
};

const DeviceControls = ({ device }) => <Controls device={device} />

export default DeviceControls;
