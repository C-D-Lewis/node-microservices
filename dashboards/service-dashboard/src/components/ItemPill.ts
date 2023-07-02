import { AppState } from '../types';
import Theme from '../theme';
import { Fabricate } from '../../node_modules/fabricate.js/types/fabricate';

declare const fabricate: Fabricate<AppState>;

/**
 * ItemPill component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Item icon.
 * @param {string} props.text - Item text.
 * @returns {HTMLElement} Fabricate component.
 */
const ItemPill = ({ src, text }: { src: string, text: string }) => {
  const {
    AppCard: { titleBar },
  } = Theme.colors;

  return fabricate('Row')
    .setStyles({
      cursor: 'default',
      borderRadius: '15px',
      backgroundColor: titleBar,
      margin: '5px',
      alignItems: 'center',
      padding: '2px 6px',
      height: 'fit-content',
    })
    .setChildren([
      fabricate('Image', { src })
        .setStyles({ width: '18px', height: '18px' }),
      fabricate('Text')
        .setStyles({
          color: 'white',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
        })
        .setText(text),
    ]);
};

export default ItemPill;