import React from 'react';
import ReactDOM from 'react-dom';
import AppMenuItem from './components/AppMenuItem';
import AppPage from './pages/AppPage';
import BlankPage from './pages/BlankPage';
import BottomBar from './components/BottomBar';
import IconButton from './components/IconButton';
import IPTextBox from './components/IPTextBox';
import LeftColumn from './components/LeftColumn';
import Navbar from './components/Navbar';
import Page from './components/Page';
import RightColumn from './components/RightColumn';

class Application extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      apps: [],
      currentIp: '',
      currentPage: BlankPage,
      currentApp: '',
      lastResponse: 'Ready',
    };

    this.onIpChange = this.onIpChange.bind(this);
    this.reload = this.reload.bind(this);
  }

  render() {
    const CurrentPage = this.state.currentPage;

    return (
      <div>
        <Navbar title="Service Dashboard" icon="../assets/raspberrypi.png">
          <IPTextBox onIpChange={this.onIpChange}/>
          <IconButton iconSrc="../assets/reload.png" borderColor="white" onClick={this.reload}/>
        </Navbar>
        <Page>
          <LeftColumn>
            {this.state.apps.map((item) => (
              <AppMenuItem key={item.app} data={item} selected={this.state.currentApp === item}
                onClick={() => this.onAppMenuItemClicked(item)}/>
            ))}
          </LeftColumn>
          <RightColumn>
            <CurrentPage state={this.state}/>
          </RightColumn>
        </Page>
        <BottomBar state={this.state}/>
      </div>
    );
  }

  componentDidMount() {
    setTimeout(this.reload, 200);
  }

  onIpChange(ip) {
    this.setState({ currentIp: ip });
  }

  reload() {
    this.setState({ currentPage: BlankPage });

    const _self = this;
    fetch(`http://${this.state.currentIp}:5959/apps`)
      .then(res => res.json())
      .then(apps => apps.sort((a, b) => a.app < b.app ? -1 : 1))
      .then(apps => _self.setState({ apps}))
      .catch(console.error);
  }

  onAppMenuItemClicked(appData) {
    this.setState({
      currentPage: AppPage,
      currentApp: appData,
    });
  }

}

ReactDOM.render(<Application/>, document.getElementById('app'));
