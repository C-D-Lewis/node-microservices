import { Fabricate } from 'fabricate.js';
import { AppState } from '../types';
import { sendConduitPacket } from '../services/conduitService';

declare const fabricate: Fabricate<AppState>;

/**
 * SwatchButton component.
 *
 * @param {object} props - Component props.
 * @param {number[]} props.color - RGB color.
 * @returns {HTMLElement} Fabricate component.
 */
const SwatchButton = ({ color }: { color: number[] }) => {
  const [red, green, blue] = color;

  const backgroundColor = `rgb(${red},${green},${blue}`;

  return fabricate('Row')
    .setStyles({
      minWidth: '30px',
      height: '30px',
      flex: '1',
      backgroundColor,
      margin: '3px',
      borderRadius: '5px',
      cursor: 'pointer',
    })
    .onClick((el, state) => {
      const message = { all: [red, green, blue] };
      sendConduitPacket(state, { to: 'visuals', topic: 'setAll', message });
    });
};

export default SwatchButton;
