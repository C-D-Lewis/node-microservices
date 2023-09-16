import { Fabricate } from 'fabricate.js';
import { AppState } from '../types';
import Theme from '../theme';

declare const fabricate: Fabricate<AppState>;

/**
 * TextButton component.
 *
 * @returns {HTMLElement} TextButton component.
 */
const TextButton = () => fabricate('Button', {
  color: 'white',
  backgroundColor: Theme.palette.primary,
})
  .setStyles({ height: '25px', fontSize: '1rem' });

export default TextButton;
