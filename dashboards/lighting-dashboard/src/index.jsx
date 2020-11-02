import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Container from './components/Container';
import DeviceCard from './components/DeviceCard';
import Navbar from './components/Navbar';
import store from './store';

const {
  devices,
} = window;

if (!devices || devices.length < 1) {
  alert('Device config not setup');
}

/**
 * LightingDashboard component.
 *
 * @returns {HTMLElement}
 */
const LightingDashboard = () => {
  return (
    <Container style={{ flexDirection: 'column', width: '100%' }}>
      <Navbar title="Lighting Dashboard" icon="../assets/string-lights.png" />
      <Container
        style={{
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
        }}>
        {devices.map(p => <DeviceCard key={p.name} device={p}/>)}
      </Container>
    </Container>
  );
};

const App = () => (
  <Provider store={store}>
    <LightingDashboard/>
  </Provider>
);

ReactDOM.render(<App/>, document.getElementById('app'));
