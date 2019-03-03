import React from 'react';
import { Colors } from '../util';
import { FlexRow } from './FlexComponents';
import AppControls from './AppControls';

const Container = ({ children, visible }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    width: '375px',
    padding: '0px 0px 15px 0px',
    margin: '10px 0px 10px 20px',
    backgroundColor: 'white',
    borderRadius: '3px',
    boxShadow: '1px 2px 3px 1px #8884',
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    transition: '0.6s',
  };

  return <div style={style}>{children}</div>;
};

const Title = ({ children }) => {
  const style = {
    fontSize: '1.3rem',
    flex: 1,
    color: 'white',
  };

  return <span style={style}>{children}</span>;
};

const Subtitle = ({ children }) => {
  const style = { fontSize: '0.9rem', color: Colors.lightGrey };

  return <span style={style}>{children}</span>;
};

const LED = ({ status }) => {
  const style = {
    backgroundColor: Colors.statusDown,
    width: '14px',
    height: '14px',
    borderRadius: '9px',
    marginRight: '5px',
  };

  if (status.includes('OK')) {
    style.backgroundColor = Colors.statusOk;
  }

  return <div style={style}/>;
};

const Status = ({ data }) => {
  const ledRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  };

  return (
    <div style={ledRowStyle}>
      <LED status={data.status}/>
      <Subtitle>{data.status} ({data.port})</Subtitle>
    </div>
  );
};

const TitleRow = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryDarkGrey,
    padding: '10px 15px',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  };

  return <div style={style}>{children}</div>;
};

class AppCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    setTimeout(() => this.setState({ visible: true }), 100);
  }

  render() {
    const { state, setState, data, conduitSend } = this.props;

    return (
      <Container visible={this.state.visible}>
        <TitleRow>
          <Title>{data.app}</Title>
          <Status data={data}/>
        </TitleRow>
        <AppControls state={state} setState={setState}
          data={data}
          conduitSend={conduitSend}/>
      </Container>
    );
  }

}

export default AppCard;
