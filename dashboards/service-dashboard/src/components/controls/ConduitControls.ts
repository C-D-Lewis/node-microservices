import { Fabricate } from 'fabricate.js';
import { AppState } from '../../types';
import TextButton from '../TextButton';
import { ControlContainer, ControlRow } from '../AppControls';
import TextBox from '../TextBox';
import { sendConduitPacket } from '../../services/conduitService';

declare const fabricate: Fabricate<AppState>;

/**
 * ConduitControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ConduitControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) => fabricate.update('conduitData', ({ conduitData }) => ({ ...conduitData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'App name' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.app), ['conduitData'])
            .setStyles({ width: '40%' })
            .onChange((el, state, value) => setProp('app', value)),
          TextBox({ placeholder: 'Topic' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.topic), ['conduitData'])
            .setStyles({ width: '60%' })
            .onChange((el, state, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Message (JSON)' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.message), ['conduitData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('message', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('Send')
            .setStyles(({ styles }) => ({ ...styles.controlButton, width: '100%' }))
            .onClick((el, state) => {
              const { conduitData } = state;
              const { app: to, topic, message } = conduitData;
              sendConduitPacket(state, { to, topic, message: JSON.parse(message) });
            }),
        ]),
    ]);
};

export default ConduitControls;
