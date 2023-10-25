import { Fabricate } from 'fabricate.js';
import { AppState } from '../../types';
import TextButton from '../TextButton';
import { ControlContainer, ControlRow } from '../AppControls';
import TextBox from '../TextBox';
import Theme from '../../theme';
import { sendConduitPacket } from '../../services/conduitService';

declare const fabricate: Fabricate<AppState>;

/**
 * GuestlistControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const GuestlistControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) => fabricate.update('guestlistData', ({ guestlistData }) => ({ ...guestlistData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Name' })
            .onUpdate((el, { guestlistData: { name } }) => el.setText(name), ['guestlistData'])
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('name', value)),
          TextBox({ placeholder: 'Apps' })
            .onUpdate((el, { guestlistData: { apps } }) => el.setText(apps), ['guestlistData'])
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('apps', value)),
          TextBox({ placeholder: 'Topics' })
            .onUpdate((el, { guestlistData: { topics } }) => el.setText(topics), ['guestlistData'])
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('topics', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Admin password' })
            .onUpdate((el, { guestlistData: { adminPassword } }) => el.setText(adminPassword), ['guestlistData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('adminPassword', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('List Users')
            .setStyles({ ...Theme.styles.controlButton, width: '33%' })
            .onClick((el, state) => sendConduitPacket(state, { to: 'guestlist', topic: 'getAll' })),
          TextButton()
            .setText('Create User')
            .setStyles({ ...Theme.styles.controlButton, width: '33%' })
            .onClick((el, state) => {
              const { guestlistData } = state;
              const {
                name, apps, topics, adminPassword,
              } = guestlistData;
              const message = {
                name,
                apps: apps.split(','),
                topics: topics.split(','),
                adminPassword,
              };
              sendConduitPacket(state, { to: 'guestlist', topic: 'create', message });
            }),
          TextButton()
            .setText('Delete User')
            .setStyles({ ...Theme.styles.controlButton, width: '33%' })
            .onClick((el, state) => {
              const { guestlistData } = state;
              const {
                name, adminPassword,
              } = guestlistData;
              const message = {
                name,
                adminPassword,
              };
              sendConduitPacket(state, { to: 'guestlist', topic: 'delete', message });
            }),
        ]),
    ]);
};

export default GuestlistControls;
