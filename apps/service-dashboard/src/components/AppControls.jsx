import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAtticData, setConduitData, setAmbienceData, setVisualsData } from '../actions';
import { Colors, Fonts } from '../theme';
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

const AtticControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const atticData = useSelector(state => state.atticData);

  const setProp = (key, value) =>
    dispatch(setAtticData({ ...atticData, [key]: value }));

  const getButtonRestyle = { width: '50%', borderBottomLeftRadius: 3 };
  const setButtonRestyle = { width: '50%', borderBottomRightRadius: 3 };

  return (
    <Column>
      <Bar>
        <TextBox value={atticData.app} placeholder="App name"
          restyle={{ width: '40%' }}
          onChange={value => setProp('app', value)}/>
        <TextBox value={atticData.key} placeholder="Key"
          restyle={{ width: '60%' }}
          onChange={value => setProp('key', value)}/>
      </Bar>
      <Bar>
        <TextBox value={atticData.value} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setProp('value', value)}/>
      </Bar>
      <ButtonBar>
        <TextButton label="Get" restyle={getButtonRestyle}
          onClick={() => {
            const { app, key } = atticData;
            const message = { app, key };
            conduitSend({ to: 'attic', topic: 'get', message })
              .then(res => setProp('value', JSON.stringify(res.message.value)));
          }}/>
        <TextButton label="Set" restyle={setButtonRestyle}
          onClick={() => {
            const { app, key, value } = atticData;
            const message = { app, key, value };
            conduitSend({ to: 'attic', topic: 'set', message });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const ConduitControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const conduitData = useSelector(state => state.conduitData);

  const setProp = (key, value) =>
    dispatch(setConduitData({ ...conduitData, [key]: value }));

  return (
    <Column>
      <Bar>
        <TextBox value={conduitData.app} placeholder="App name"
          restyle={{ width: '40%' }}
          onChange={value => setProp('app', value)}/>
        <TextBox value={conduitData.topic} placeholder="Topic"
          restyle={{ width: '60%' }}
          onChange={value => setProp('topic', value)}/>
      </Bar>
      <Bar>
        <TextBox value={conduitData.message} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setProp('message', value)}/>
      </Bar>
      <ButtonBar>
        <TextButton label="Send"
          restyle={{ width: '100%', borderRadius: '0px 0px 3px 3px' }}
          onClick={() => {
            const { app: to, topic, message } = conduitData;
            conduitSend({ to, topic, message: JSON.parse(message) });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const AmbienceControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const ambienceData = useSelector(state => state.ambienceData);

  const setProp = (key, value) =>
    dispatch(setAmbienceData({ ...ambienceData, [key]: value }));

  const buttonRestyle = { width: '20%' };

  return (
    <Column>
      <Bar>
        <TextBox value={ambienceData.red} placeholder="red"
          restyle={{ width: "33%" }}
          onChange={value => setProp('red', value)}/>
        <TextBox value={ambienceData.green} placeholder="green"
          restyle={{ width: "33%" }}
          onChange={value => setProp('green', value)}/>
        <TextBox value={ambienceData.blue} placeholder="blue"
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
            const { red, green, blue } = ambienceData;
            conduitSend({
              to: 'ambience',
              topic: 'set',
              message: { all: [parseInt(red), parseInt(green), parseInt(blue)] },
            });
          }}/>
        <TextButton label="Fade" restyle={{ width: '20%', borderBottomRightRadius: 3 }}
          onClick={() => {
            const { red, green, blue } = ambienceData;
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

const VisualsControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const visualsData = useSelector(state => state.visualsData);

  const setProp = (key, value) =>
    dispatch(setVisualsData({ ...visualsData, [key]: value }));

  const buttonRestyle = { width: '20%' };

  return (
    <Column>
      <Bar>
        <TextBox value={visualsData.index} placeholder="index"
          restyle={{ width: "10%" }}
          onChange={value => setProp('index', value)}/>
        <TextBox value={visualsData.red} placeholder="red"
          restyle={{ width: "30%" }}
          onChange={value => setProp('red', value)}/>
        <TextBox value={visualsData.green} placeholder="green"
          restyle={{ width: "30%" }}
          onChange={value => setProp('green', value)}/>
        <TextBox value={visualsData.blue} placeholder="blue"
          restyle={{ width: "30%" }}
          onChange={value => setProp('blue', value)}/>
      </Bar>
      <Bar>
        <TextBox value={visualsData.text} placeholder="text"
          restyle={{ width: "100%" }}
          onChange={value => setProp('text', value)}/>
      </Bar>
      <ButtonBar>
        <TextButton label="All" restyle={{ width: '20%', borderBottomLeftRadius: 3 }}
          onClick={() => {
            const { red, green, blue } = visualsData;
            conduitSend({
              to: 'visuals',
              topic: 'setAll',
              message: { all: [red, green, blue] },
            });
          }}/>
        <TextButton label="Pixel" restyle={buttonRestyle}
          onClick={() => {
            const { index, red, green, blue } = visualsData;
            conduitSend({
              to: 'visuals',
              topic: 'setPixel',
              message: { [index]: [red, green, blue] },
            });
          }}/>
        <TextButton label="Blink" restyle={buttonRestyle}
          onClick={() => {
            const { index, red, green, blue } = visualsData;
            conduitSend({
              to: 'visuals',
              topic: 'blink',
              message: { [index]: [red, green, blue] },
            });
          }}/>
        <TextButton label="Text" restyle={buttonRestyle}
          onClick={() => {
            const { text } = visualsData;
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

const AppControls = ({ data, conduitSend }) => {
  const controlsMap = {
    attic: AtticControls,
    conduit: ConduitControls,
    ambience: AmbienceControls,
    visuals: VisualsControls,
  };

  const Controls = controlsMap[data.app] || NoControls;
  return <Controls conduitSend={conduitSend}/>;
};

export default AppControls;
