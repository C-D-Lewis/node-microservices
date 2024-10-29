import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types';

declare const fabricate: Fabricate<AppState>;

/**
 * IconButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Icon src.
 * @returns {FabricateComponent} IconButton component.
 */
const IconButton = ({ src }: { src: string }) => fabricate('Image', { src })
  .setStyles(({ palette }) => ({
    width: '26px',
    height: '26px',
    backgroundColor: palette.grey3,
    padding: '3px',
    borderRadius: '3px',
    marginRight: '5px',
    cursor: 'pointer',
  }));

export default IconButton;
