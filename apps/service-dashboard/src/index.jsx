import React from 'react';
import ReactDOM from 'react-dom';
import AppCard from './components/AppCard';
import { BottomBar } from './components/BottomBar';
import Container from './components/Container';
import FleetItem from './components/FleetItem';
import IconButton from './components/IconButton';
import IPTextBox from './components/IPTextBox';
import LeftColumn from './components/LeftColumn';
import MainArea from './components/MainArea';
import Navbar from './components/Navbar';

const {
  /* Where the fleet list can be found. */
  FLEET_HOST,
} = window.config;
/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

class Application extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      apps: [],
      fleetList: [],
      ip: FLEET_HOST,
      bottomBarText: 'Ready',
      atticData: {
        app: '',
        key: '',
        value: '',
      },
      conduitData: {
        app: '',
        topic: 'status',
        message: '{}',
      },
      ambienceData: {
        red: 128,
        green: 128,
        blue: 128,
      },
      visualsData: {
        index: 0,
        red: 128,
        green: 128,
        blue: 128,
        text: '',
      },
    };

    this.setState = this.setState.bind(this);
    this.setIp = this.setIp.bind(this);
    this.conduitSend = this.conduitSend.bind(this);
  }

  componentDidMount() {
    setTimeout(() => this.loadFleetList(), 200);
  }

  loadFleetList() {
    this.setState({ fleetList: [] });

    const packet = {
      to: 'attic',
      topic: 'get',
      message: { app: 'conduit', key: 'fleetList' },
    };
    const opts = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
    };
    fetch(`http://${FLEET_HOST}:${CONDUIT_PORT}/conduit`, opts)
      .then(res => res.json())
      .then(json => json.message.value)
      .then(fleetList => this.setState({ fleetList }))
      .catch(console.error);
  }

  loadApps() {
    this.setState({ apps: [] });

    fetch(`http://${this.state.ip}:${CONDUIT_PORT}/apps`)
      .then(res => res.json())
      .then(apps => apps.sort((a, b) => a.app < b.app ? -1 : 1))
      .then(apps => this.setState({ apps }))
      .catch(console.error);
  }

  setIp(ip) {
    this.setState({ ip }, this.loadApps);
  }

  conduitSend(packet) {
    this.setState({ bottomBarText: '' });

    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
    };
    return fetch(`http://${this.state.ip}:5959/conduit`, opts)
      .then(res => res.json())
      .then((json) => {
        this.setState({ bottomBarText: JSON.stringify(json) });
        return json;
      });
  }

  render() {
    const CurrentPage = this.state.currentPage;

    return (
      <div>
        <Navbar title="Service Dashboard" icon="../assets/raspberrypi.png">
          <IPTextBox ip={this.state.ip} onChange={ip => this.setState({ ip })}/>
          <IconButton iconSrc="../assets/reload.png" onClick={() => this.loadApps()}/>
        </Navbar>
        <Container restyle={{ width: '100%' }}>
          <LeftColumn>
            {this.state.fleetList.map(p => (
              <FleetItem key={p.deviceName} data={p} setIp={this.setIp}/>
            ))}
          </LeftColumn>
          <MainArea>
            {this.state.apps.map(p => (
              <AppCard key={p.app} state={this.state} setState={this.setState}
                data={p}
                conduitSend={this.conduitSend}/>
            ))}
          </MainArea>
          <BottomBar>{this.state.bottomBarText}</BottomBar>
        </Container>
      </div>
    );
  }

}

ReactDOM.render(<Application/>, document.getElementById('app'));
