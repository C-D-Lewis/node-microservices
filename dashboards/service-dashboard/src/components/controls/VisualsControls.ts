import { Fabricate } from 'fabricate.js';
import { AppState } from '../../types';
import TextButton from '../TextButton';
import { ControlContainer, ControlRow } from '../AppControls';
import TextBox from '../TextBox';
import { sendConduitPacket } from '../../services/conduitService';
import SwatchButton from '../SwatchButton';

declare const fabricate: Fabricate<AppState>;

/** Colors for demo */
const DEMO_COLORS = [
  [255, 0, 0],    // Red
  [255, 127, 0],  // Orange
  [255, 255, 0],  // Yellow
  [127, 255, 0],  // Lime green
  [0, 255, 0],    // Green
  [0, 255, 127],  // Pastel green
  [0, 255, 255],  // Cyan
  [0, 127, 255],  // Sky blue
  [0, 0, 255],    // Blue
  [127, 0, 255],  // Purple
  [255, 0, 255],  // Pink
  [255, 0, 127],  // Hot pink
];

/**
 * ConduitControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const VisualsControls = () => {
  const row1Colors = DEMO_COLORS.slice(0, 5);
  const row2Colors = DEMO_COLORS.slice(6, 11);
  const row3Colors = [[255, 255, 255], [64, 64, 64], [0, 0, 0]];
  const swatchRowStyles = { width: '100%', padding: '5px 0px 0px 0px' };

  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string | number) => fabricate.update('visualsData', ({ visualsData }) => ({ ...visualsData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .asFlex('column')
        .setChildren([
          ControlRow()
            .setStyles(swatchRowStyles)
            .setChildren(row1Colors.map((color) => SwatchButton({ color }))),
          ControlRow()
            .setStyles(swatchRowStyles)
            .setChildren(row2Colors.map((color) => SwatchButton({ color }))),
          ControlRow()
            .setStyles(swatchRowStyles)
            .setChildren(row3Colors.map((color) => SwatchButton({ color }))),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Red' })
            .onUpdate((el, { visualsData: { red } }) => el.setText(String(red)), ['visualsData'])
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('red', parseInt(value, 10))),
          TextBox({ placeholder: 'Green' })
            .onUpdate((el, { visualsData: { green } }) => el.setText(String(green)), ['visualsData'])
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('green', parseInt(value, 10))),
          TextBox({ placeholder: 'Blue' })
            .onUpdate((el, { visualsData: { blue } }) => el.setText(String(blue)), ['visualsData'])
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('blue', parseInt(value, 10))),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Text' })
            .onUpdate((el, { visualsData: { text } }) => el.setText(text), ['visualsData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('text', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('All')
            .setStyles(({ styles }) => ({ ...styles.controlButton, width: '20%' }))
            .onClick((el, state) => {
              const { visualsData } = state;
              const { red, green, blue } = visualsData;
              const message = { all: [red, green, blue] };
              sendConduitPacket(state, { to: 'visuals', topic: 'setAll', message });
            }),
          TextButton()
            .setText('Pixel')
            .setStyles(({ styles }) => ({ ...styles.controlButton, width: '20%' }))
            .onClick((el, state) => {
              const { visualsData } = state;
              const {
                index, red, green, blue,
              } = visualsData;
              const message = { [index]: [red, green, blue] };
              sendConduitPacket(state, { to: 'visuals', topic: 'setPixel', message });
            }),
          TextButton()
            .setText('Blink')
            .setStyles(({ styles }) => ({ ...styles.controlButton, width: '20%' }))
            .onClick((el, state) => {
              const { visualsData } = state;
              const {
                index, red, green, blue,
              } = visualsData;
              const message = { [index]: [red, green, blue] };
              sendConduitPacket(state, { to: 'visuals', topic: 'blink', message });
            }),
          TextButton()
            .setText('Text')
            .setStyles(({ styles }) => ({ ...styles.controlButton, width: '20%' }))
            .onClick((el, state) => {
              const { visualsData } = state;
              const { text } = visualsData;
              const message = { lines: [text] };
              sendConduitPacket(state, { to: 'visuals', topic: 'setText', message });
            }),
          TextButton()
            .setText('State')
            .setStyles(({ styles }) => ({ ...styles.controlButton, width: '20%' }))
            .onClick((el, state) => sendConduitPacket(state, { to: 'visuals', topic: 'state' })),
        ]),
    ]);
};

export default VisualsControls;
