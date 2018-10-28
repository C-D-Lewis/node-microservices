import React from 'react';
import { FlexColumn, FlexRow } from '../components/FlexComponents';
import IconButton from '../components/IconButton';
import TextBox from '../components/TextBox';

const sendConduitMessage = (ip, message) =>
  fetch(`http://${ip}:5959/conduit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  }).then(res => res.json());

class BacklightServerOptions extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      inputs: {
      },
    };
    
    this.onInputChanged = this.onInputChanged.bind(this);
    this.send = this.send.bind(this);
  }
  
  render() {
    return (
      <FlexColumn>
        <FlexRow>
          <div className="app-page-subheading">Spotify</div>
        </FlexRow>
        <FlexRow>
          <IconButton iconSrc="../../assets/spotify.png" onClick={() => this.send('spotify')}/>
        </FlexRow>
      </FlexColumn>
    );
  }
  
  send(topic) {
    sendConduitMessage(this.props.ip, {
      to: 'BacklightServer',
      topic,
      message: {},
    }).then(res => this.props.onResponse(JSON.stringify(res, null, 2)));
  }
  
  onInputChanged(key, value) {
    const oldState = this.state;
    oldState.inputs[key] = value;
    this.setState(oldState);
  }

}

class AtticOptions extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      inputs: {
        app: '',
        key: '',
        value: '',
      },
    };
    
    this.onInputChanged = this.onInputChanged.bind(this);
    this.send = this.send.bind(this);
  }
  
  render() {
    return (
      <FlexColumn>
        <FlexRow>
          <div className="app-page-subheading">Send Message</div>
        </FlexRow>
        <FlexRow>
          <IconButton iconSrc="../../assets/download.png" onClick={() => this.send('get')}/>
          <IconButton iconSrc="../../assets/upload.png" onClick={() => this.send('set')}/>
        </FlexRow>
        <FlexRow>
          <table>
            <tbody>
              <tr>
                <td>App:</td>
                <td><TextBox onChange={val => this.onInputChanged('app', val)}/></td>
              </tr>
              <tr>
                <td>Key:</td>
                <td><TextBox onChange={val => this.onInputChanged('key', val)}/></td>
              </tr>
              <tr>
                <td>Value:</td>
                <td><TextBox onChange={val => this.onInputChanged('value', val)}/></td>
              </tr>
            </tbody>
          </table>
        </FlexRow>
      </FlexColumn>
    );
  }
  
  send(topic) {
    sendConduitMessage(this.props.ip, {
      to: 'Attic',
      topic,
      message: {
        app: this.state.inputs.app,
        key: this.state.inputs.key,
        value: this.state.inputs.value,
      },
    }).then(res => this.props.onResponse(JSON.stringify(res, null, 2)));
  }
  
  onInputChanged(key, value) {
    const oldState = this.state;
    oldState.inputs[key] = value;
    this.setState(oldState);
  }

}

class ConduitOptions extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      inputs: {
        app: '',
        topic: '',
        message: '{}',
      },
    };
    
    this.onInputChanged = this.onInputChanged.bind(this);
    this.send = this.send.bind(this);
  }
  
  render() {
    return (
      <FlexColumn>
        <FlexRow>
          <div className="app-page-subheading">Send Message</div>
        </FlexRow>
        <FlexRow>
          <IconButton iconSrc="../../assets/upload.png" onClick={this.send}/>
        </FlexRow>
        <FlexRow>
          <table>
            <tbody>
              <tr>
                <td>App:</td>
                <td><TextBox onChange={val => this.onInputChanged('app', val)}/></td>
              </tr>
              <tr>
                <td>Topic:</td>
                <td><TextBox onChange={val => this.onInputChanged('topic', val)}/></td>
              </tr>
              <tr>
                <td>Message:</td>
                <td><TextBox onChange={val => this.onInputChanged('message', val)}/></td>
              </tr>
            </tbody>
          </table>
        </FlexRow>
      </FlexColumn>
    );
  }
  
  onInputChanged(key, value) {
    const oldState = this.state;
    oldState.inputs[key] = value;
    this.setState(oldState);
  }
  
  send() {
    sendConduitMessage(this.props.ip, {
      to: this.state.inputs.app,
      topic: this.state.inputs.topic,
      message: JSON.parse(this.state.inputs.message),
    }).then(res => this.props.onResponse(JSON.stringify(res, null, 2)));
  }
  
}

class AppPage extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      response: 'None yet',
    };
    
    this.onResponse = this.onResponse.bind(this);
  }
  
  render() {
    const { currentApp: data } = this.props.appState;
    return (
      <FlexColumn>
        <div className="app-page-heading">{data.app}</div>
        <FlexRow>
          <span>Port: {data.port}</span>
        </FlexRow>
        <FlexRow>
          <span>Status: {data.status}</span>
        </FlexRow>
        
        { data.app === 'Conduit' && <FlexRow>
          <ConduitOptions ip={this.props.appState.currentIp} onResponse={this.onResponse}/>
        </FlexRow> }
        
        { data.app === 'Attic' && <FlexRow>
          <AtticOptions ip={this.props.appState.currentIp} onResponse={this.onResponse}/>
        </FlexRow> }

        { data.app === 'BacklightServer' && <FlexRow>
          <BacklightServerOptions ip={this.props.appState.currentIp} onResponse={this.onResponse}/>
        </FlexRow> }
        
        <FlexRow>
          <div className="app-page-subheading">Last Response</div>
        </FlexRow>
        <pre className="response-view">{this.state.response}</pre>
      </FlexColumn>
    );
  }
  
  onResponse(response) {
    this.setState({ response });
  }
  
}

export default AppPage;
