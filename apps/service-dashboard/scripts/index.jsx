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
    paddingBottom: BOTTOM_BAR_HEIGHT,
  };

  return <div style={style}>{children}</div>;
};

class Application extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      apps: [],
      ip: '',
      lastResponse: 'Ready',
    };

    this.loadApps = this.loadApps.bind(this);
  }

  componentDidMount() {
    setTimeout(this.loadApps, 200);
  }

  render() {
    const CurrentPage = this.state.currentPage;

    return (
      <div className="root-container">
        <Navbar title="Service Dashboard" icon="../assets/raspberrypi.png">
          <IPTextBox setState={this.setState.bind(this)}/>
          <IconButton iconSrc="../assets/reload.png" onClick={this.loadApps}/>
        </Navbar>
        <Page>
          {this.state.apps.map(p => <AppCard key={p.app} data={p}/>)}
        </Page>
        <BottomBar>{this.state.lastResponse}</BottomBar>
      </div>
    );
  }

  loadApps() {
    const _self = this;
    fetch(`http://${this.state.ip}:${CONDUIT_PORT}/apps`)
      .then(res => res.json())
      .then(apps => apps.sort((a, b) => a.app < b.app ? -1 : 1))
      .then(apps => _self.setState({ apps }))
      .catch(console.error);
  }

}

ReactDOM.render(<Application/>, document.getElementById('app'));
