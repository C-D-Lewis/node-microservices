import React from 'react';
import { Colors, Fonts } from '../util';
import IconButton from './IconButton';
import TextBox from './TextBox';
import TextButton from './TextButton';

const NoControls = () => <div/>;

const Bar = ({ children, align }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
    padding: '0px 10px',
  };

  return <div style={style}>{children}</div>;
};

const ButtonBar = ({ children, align }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
  };

  return <div style={style}>{children}</div>;
};

const Column = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  return <div style={style}>{children}</div>;
};

const AtticControls = ({ state, setState, conduitSend }) => {
  const setProp = (key, value) => {
    const { atticControls } = state;
    atticControls[key] = value;
    setState({ atticControls });
  };
  const getButtonRestyle = { width: '50%', borderBottomLeftRadius: 3 };
  const setButtonRestyle = { width: '50%', borderBottomRightRadius: 3 };

  return (
    <Column>
      <Bar>
        <TextBox value={state.atticControls.app} placeholder="App name"
          restyle={{ width: '40%' }}
          onChange={value => setProp('app', value)}/>
        <TextBox value={state.atticControls.key} placeholder="Key"
          restyle={{ width: '60%' }}
          onChange={value => setProp('key', value)}/>
      </Bar>
      <Bar>
        <TextBox value={state.atticControls.value} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setProp('value', value)}/>
      </Bar>
      <ButtonBar>
        <TextButton label="Get" restyle={getButtonRestyle}
          onClick={() => {
            const { app, key } = state.atticControls;
            const message = { app, key };
            conduitSend({ to: 'attic', topic: 'get', message })
              .then(res => setProp('value', JSON.stringify(res.message.value)));
          }}/>
        <TextButton label="Set" restyle={setButtonRestyle}
          onClick={() => {
            const { app, key, value } = state.atticControls;
            const message = { app, key, value };
            conduitSend({ to: 'attic', topic: 'set', message });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const ConduitControls = ({ state, setState, conduitSend }) => {
  const setProp = (key, value) => {
    const { conduitControls } = state;
    conduitControls[key] = value;
    setState({ conduitControls });
  };

  return (
    <Column>
      <Bar>
        <TextBox value={state.conduitControls.app} placeholder="App name"
          restyle={{ width: '40%' }}
          onChange={value => setProp('app', value)}/>
        <TextBox value={state.conduitControls.topic} placeholder="Topic"
          restyle={{ width: '60%' }}
          onChange={value => setProp('topic', value)}/>
      </Bar>
      <Bar>
        <TextBox value={state.conduitControls.message} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setProp('message', value)}/>
      </Bar>
      <ButtonBar>
        <TextButton label="Send"
          restyle={{ width: '100%', borderRadius: '0px 0px 3px 3px' }}
          onClick={() => {
            const { app: to, topic, message } = state.conduitControls;
            conduitSend({ to, topic, message: JSON.parse(message) });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const AmbienceControls = ({ state, setState, conduitSend }) => {
  const setProp = (key, value) => {
    const { ambienceControls } = state;
    ambienceControls[key] = value;
    setState({ ambienceControls });
  };
  const buttonRestyle = { width: '20%' };

  return (
    <Column>
      <Bar>
        <TextBox value={state.ambienceControls.red} placeholder="red"
          restyle={{ width: "33%" }}
          onChange={value => setProp('red', value)}/>
        <TextBox value={state.ambienceControls.green} placeholder="green"
          restyle={{ width: "33%" }}
          onChange={value => setProp('green', value)}/>
        <TextBox value={state.ambienceControls.blue} placeholder="blue"
          restyle={{ width: "33%" }}
          onChange={value => setProp('blue', value)}/>
      </Bar>
      <ButtonBar>
        <TextButton label="Off" restyle={{ width: '20%', borderBottomLeftRadius: 3 }}
          onClick={() => conduitSend({ to: 'ambience', topic: 'off' })}/>
        <TextButton label="Spotify" restyle={buttonRestyle}
          onClick={() => conduitSend({ to: 'ambience', topic: 'spotify' })}/>
        <TextButton label="Demo" restyle={buttonRestyle}
          onClick={() => conduitSend({ to: 'ambience', topic: 'demo' })}/>
        <TextButton label="Set" restyle={buttonRestyle}
          onClick={() => {
            const { red, green, blue } = state.ambienceControls;
            conduitSend({
              to: 'ambience',
              topic: 'set',
              message: { all: [red, green, blue] },
            });
          }}/>
        <TextButton label="Fade" restyle={{ width: '20%', borderBottomRightRadius: 3 }}
          onClick={() => {
            const { red, green, blue } = state.ambienceControls;
            conduitSend({
              to: 'ambience',
              topic: 'fade',
              message: { all: [parseInt(red), parseInt(green), parseInt(blue)] },
            });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const VisualsControls = ({ state, setState, conduitSend }) => {
  const setProp = (key, value) => {
    const { visualsControls } = state;
    visualsControls[key] = value;
    setState({ visualsControls });
  };
  const buttonRestyle = { width: '20%' };

  return (
    <Column>
      <Bar>
        <TextBox value={state.visualsControls.index} placeholder="index"
          restyle={{ width: "10%" }}
          onChange={value => setProp('index', value)}/>
        <TextBox value={state.visualsControls.red} placeholder="red"
          restyle={{ width: "30%" }}
          onChange={value => setProp('red', value)}/>
        <TextBox value={state.visualsControls.green} placeholder="green"
          restyle={{ width: "30%" }}
          onChange={value => setProp('green', value)}/>
        <TextBox value={state.visualsControls.blue} placeholder="blue"
          restyle={{ width: "30%" }}
          onChange={value => setProp('blue', value)}/>
      </Bar>
      <Bar>
        <TextBox value={state.visualsControls.text} placeholder="text"
          restyle={{ width: "100%" }}
          onChange={value => setProp('text', value)}/>
      </Bar>
      <ButtonBar>
        <TextButton label="All" restyle={{ width: '20%', borderBottomLeftRadius: 3 }}
          onClick={() => {
            const { red, green, blue } = state.visualsControls;
            conduitSend({
              to: 'visuals',
              topic: 'setAll',
              message: { all: [red, green, blue] },
            });
          }}/>
        <TextButton label="Pixel" restyle={buttonRestyle}
          onClick={() => {
            const { index, red, green, blue } = state.visualsControls;
            conduitSend({
              to: 'visuals',
              topic: 'setPixel',
              message: { [index]: [red, green, blue] },
            });
          }}/>
        <TextButton label="Blink" restyle={buttonRestyle}
          onClick={() => {
            const { index, red, green, blue } = state.visualsControls;
            conduitSend({
              to: 'visuals',
              topic: 'blink',
              message: { [index]: [red, green, blue] },
            });
          }}/>
        <TextButton label="Text" restyle={buttonRestyle}
          onClick={() => {
            const { text } = state.visualsControls;
            conduitSend({
              to: 'visuals',
              topic: 'setText',
              message: { lines: [text] },
            });
          }}/>
        <TextButton label="State" restyle={{ width: '20%', borderBottomRightRadius: 3 }}
          onClick={() => {
            conduitSend({
              to: 'visuals',
              topic: 'state',
              message: {},
            });
          }}/>
      </ButtonBar>
    </Column>
  );
};


const Container = ({ children }) => {
  const style = {};

  return <div style={style}>{children}</div>;
}

const AppControls = ({ state, setState, data, conduitSend }) => {
  const controlsMap = {
    attic: AtticControls,
    conduit: ConduitControls,
    ambience: AmbienceControls,
    visuals: VisualsControls,
  };

  const Controls = controlsMap[data.app] || NoControls;
  return (
    <Container>
      <Controls data={data} state={state} setState={setState}
        conduitSend={conduitSend}/>
    </Container>
  );
};

export default AppControls;
