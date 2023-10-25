import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types';

declare const fabricate: Fabricate<AppState>;

/**
 * TextBox component.
 *
 * @param {object} props - Component props.
 * @param {string} props.placeholder - Placeholder text.
 * @returns {FabricateComponent} TextBox component.
 */
const TextBox = ({ placeholder = '' }: { placeholder: string }) => fabricate('TextInput', { placeholder, color: 'white' })
  .setStyles({
    height: '25px',
    border: '0',
    fontSize: '1rem',
    padding: '5px 5px 2px 10px',
    margin: '10px 5px',
    outline: 'none',
    fontFamily: 'monospace',
    backgroundColor: '#1115',
  });

export default TextBox;
