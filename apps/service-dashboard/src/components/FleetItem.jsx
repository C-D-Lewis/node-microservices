import React from 'react';

const Name = ({ children }) => {
  const style = {
    color: 'black',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    paddingLeft: '15px',
    marginBottom: '5px',
  };

  return <span style={style}>{children}</span>;
};

const IP = ({ children, onClick, reachable }) => {
  const style = {
    color: reachable ? 'black' : 'lightgrey',
    fontSize: '1.1rem',
    paddingLeft: '25px',
    fontFamily: 'monospace',
    margin: '5px 0px 5px 0px',
    cursor: 'pointer',
  };

  return <span style={style} onClick={onClick}>{children}</span>;
};

const Container = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    border: '0',
    margin: '10px 0px 10px 0px',
  };

  return <div style={style}>{children}</div>;
};

class FleetItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      reachable: {
        publicIp: false,
        localIp: false,
      },
    };

    this.setState = this.setState.bind(this);
  }

  testIp(name) {
    fetch(`http://${this.props.data[name]}:5959/apps`)
      .then(res => res.json())
      .then(json => this.setState({ reachable: { [name]: true } }))
      .catch(() => {});
  }

  componentDidMount() {
    this.testIp('publicIp');
    this.testIp('localIp');
  }

  render() {
    const { deviceName, publicIp, localIp } = this.props.data;

    return (
      <Container>
        <Name>{deviceName}</Name>
        <IP reachable={this.state.reachable.publicIp} onClick={() => this.props.loadIp(publicIp)}>
          {publicIp}
        </IP>
        <IP reachable={this.state.reachable.localIp} onClick={() => this.props.loadIp(localIp)}>
          {localIp}
        </IP>
      </Container>
    );
  }

};

export default FleetItem;
