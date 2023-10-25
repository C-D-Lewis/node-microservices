import { Fabricate } from 'fabricate.js';
import { AppState } from '../../types';
import TextButton from '../TextButton';
import { ControlContainer, ControlRow } from '../AppControls';
import TextBox from '../TextBox';
import Theme from '../../theme';
import { sendConduitPacket } from '../../services/conduitService';

declare const fabricate: Fabricate<AppState>;

/**
 * AtticControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AtticControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) => fabricate.update('atticData', ({ atticData }) => ({ ...atticData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'App name' })
            .setStyles({ width: '40%' })
            .onUpdate((el, { atticData }) => el.setText(atticData.app), ['atticData'])
            .onChange((el, state, value) => setProp('app', value)),
          TextBox({ placeholder: 'Key' })
            .setStyles({ width: '60%' })
            .onUpdate((el, { atticData }) => el.setText(atticData.key), ['atticData'])
            .onChange((el, state, value) => setProp('key', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Value' })
            .onUpdate((el, { atticData }) => el.setText(atticData.value), ['atticData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('value', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('Get')
            .setStyles({ ...Theme.styles.controlButton, width: '33%' })
            .onClick(async (el, state) => {
              const { atticData } = state;
              const { app, key } = atticData;
              const res = await sendConduitPacket(state, { to: 'attic', topic: 'get', message: { app, key } });
              setProp('value', JSON.stringify(res.message.value));
            }),
          TextButton()
            .setText('Set')
            .setStyles({ ...Theme.styles.controlButton, width: '33%' })
            .onClick((el, state) => {
              const { atticData } = state;
              const { app, key, value } = atticData;
              sendConduitPacket(state, { to: 'attic', topic: 'set', message: { app, key, value } });
            }),
          TextButton()
            .setText('List Apps')
            .setStyles({ ...Theme.styles.controlButton, width: '33%' })
            .onClick((el, state) => {
              sendConduitPacket(state, { to: 'attic', topic: 'listApps', message: {} });
            }),
        ]),
    ]);
};

export default AtticControls;
