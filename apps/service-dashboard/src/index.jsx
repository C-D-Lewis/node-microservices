import React from 'react';
import ReactDOM from 'react-dom';
import { BOTTOM_BAR_HEIGHT } from './util';
import AppCard from './components/AppCard';
import BottomBar from './components/BottomBar';
import IconButton from './components/IconButton';
import IPTextBox from './components/IPTextBox';
import Navbar from './components/Navbar';

const CONDUIT_PORT = 5959;

const Page = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingTop: '10px',
    paddingBottom: 2 * BOTTOM_BAR_HEIGHT,
    alignItems: 'flex-start',
  };

  return <div style={style}>{children}</div>;
};

class Application extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      apps: [],
      ip: '',
      bottomBarText: 'Ready',
      atticControls: {
        app: '',
        key: '',
        value: '',
      },
      conduitControls: {
        app: '',
        topic: 'status',
        message: '{}',
      },
      backlightServerControls: {
        red: 128,
        green: 128,
        blue: 128,
      },
    };

    this.loadApps = this.loadApps.bind(this);
  }

  componentDidMount() {
    setTimeout(this.loadApps, 200);
  }

  loadApps() {
    this.setState({ apps: [] });

    fetch(`http://${this.state.ip}:${CONDUIT_PORT}/apps`)
      .then(res => res.json())
      .then(apps => apps.sort((a, b) => a.app < b.app ? -1 : 1))
      .then(apps => this.setState({ apps, bottomBarText: `Read ${apps.length} apps` }))
      .catch(console.error);
  }

  conduitSend(packet) {
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
          <IPTextBox setState={this.setState.bind(this)}/>
          <IconButton iconSrc="../assets/reload.png" onClick={this.loadApps}/>
        </Navbar>
        <Page>
          {this.state.apps.map(p => (
            <AppCard key={p.app} state={this.state} setState={this.setState.bind(this)}
              data={p}
              conduitSend={this.conduitSend.bind(this)}/>
          ))}
        </Page>
        <BottomBar>{this.state.bottomBarText}</BottomBar>
      </div>
    );
  }

}

ReactDOM.render(<Application/>, document.getElementById('app'));
