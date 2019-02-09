import React from 'react';
import ReactDOM from 'react-dom';
import BottomBar from './components/BottomBar';
import IconButton from './components/IconButton';
import IPTextBox from './components/IPTextBox';
import Navbar from './components/Navbar';
import Page from './components/Page';

const CONDUIT_PORT = 5959;

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
      <div>
        <Navbar title="Service Dashboard" icon="../assets/raspberrypi.png">
          <IPTextBox setState={this.setState.bind(this)}/>
          <IconButton iconSrc="../assets/reload.png" onClick={this.loadApps}/>
        </Navbar>
        <Page>
          
        </Page>
        <BottomBar state={this.state}/>
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
