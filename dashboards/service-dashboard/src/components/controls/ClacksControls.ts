import { Fabricate } from 'fabricate.js';
import Theme from '../../theme';
import { AppState } from '../../types';
import TextButton from '../TextButton';
import { ControlContainer, ControlRow } from '../AppControls';
import { connectClacks, disconnectClacks, sendClacksMessage } from '../../services/clacksService';
import { getReachableIp } from '../../utils';
import TextBox from '../TextBox';

declare const fabricate: Fabricate<AppState>;

/**
 * ClacksControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ClacksControls = () => {
  // list devices, most recent messages, and send messages

  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) => fabricate.update('clacksData', ({ clacksData }) => ({ ...clacksData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Topic' })
            .onUpdate((el, { clacksData: { topic } }) => el.setText(topic), ['clacksData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Message' })
            .onUpdate((el, { clacksData: { message } }) => el.setText(message), ['clacksData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('message', value))
            .onCreate((el) => {
              // Default value is JSON
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              el.value = '{}';
            }),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('Send')
            .setStyles({ ...Theme.styles.controlButton, width: '100%', backgroundColor: Theme.palette.grey3 })
            .onClick((el, { clacksData }) => {
              const { topic, message } = clacksData;
              sendClacksMessage(topic, message);
            })
            .onUpdate((el, { clacksData: { connected } }) => el.setStyles({
              backgroundColor: connected ? Theme.palette.primary : Theme.palette.grey3,
            }), ['clacksData']),
        ]),
    ])
    .onCreate((el, state) => {
      const { clacksData } = state;

      // Try and connect if not connected
      if (clacksData.connected) disconnectClacks();
      setTimeout(() => connectClacks(getReachableIp(state)!), 500);
    });
};

export default ClacksControls;
