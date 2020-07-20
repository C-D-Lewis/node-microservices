import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { sendDevicePacket } from './services/apiService';
import Container from './components/Container';
import Navbar from './components/Navbar';
import store from './store';

const {
  devices,
} = window;

if (!devices || devices.length < 1) {
  alert('Device config not setup');
}

const LightingDashboard = () => {
  return (
    <Container style={{ width: '100%' }}>
      <Navbar title="Lighting Dashboard" icon="../assets/string-lights.png">
      </Navbar>
      <Container style={{ width: '100%' }}>
        {/* List of cards for each device */}
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
