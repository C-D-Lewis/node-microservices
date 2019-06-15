import React from 'react';
import ReactDOM from 'react-dom';
import { BOTTOM_BAR_HEIGHT } from './util';
import AppCard from './components/AppCard';
import BottomBar from './components/BottomBar';
import IconButton from './components/IconButton';
import IPTextBox from './components/IPTextBox';
import Navbar from './components/Navbar';
import FleetItem from './components/FleetItem';

const FLEET_HOST = '46.101.3.163';
const CONDUIT_PORT = 5959;

const Page = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  };

  return <div style={style}>{children}</div>;
};

const WidgetArea = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    flex: 5,
    flexWrap: 'wrap',
    width: '100%',
    paddingTop: '10px',
    paddingBottom: 2 * BOTTOM_BAR_HEIGHT,
    alignItems: 'flex-start',
  };

  return <div style={style}>{children}</div>;
};

const FleetArea = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    height: '100vh',
    alignItems: 'flex-start',
    borderRight: 'solid 1px #0004',
    paddingTop: 10,
    boxShadow: '0px 2px 3px 1px #5557',
  };

  return <div style={style}>{children}</div>;
};

class Application extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      apps: [],
      fleetList: [],
      ip: '',
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
    this.loadApps = this.loadApps.bind(this);
    this.loadIp = this.loadIp.bind(this);
    this.conduitSend = this.conduitSend.bind(this);
    this.loadFleetList = this.loadFleetList.bind(this);
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

  loadIp(ip) {
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
          <IconButton iconSrc="../assets/reload.png" onClick={this.loadApps}/>
        </Navbar>
        <Page>
          <FleetArea>
            {this.state.fleetList.map(p => (
              <FleetItem key={p.deviceName} data={p} loadIp={this.loadIp}/>
            ))}
          </FleetArea>
          <WidgetArea>
            {this.state.apps.map(p => (
              <AppCard key={p.app} state={this.state} setState={this.setState}
                data={p}
                conduitSend={this.conduitSend}/>
            ))}
          </WidgetArea>
          <BottomBar>{this.state.bottomBarText}</BottomBar>
        </Page>
      </div>
    );
  }

}

ReactDOM.render(<Application/>, document.getElementById('app'));
