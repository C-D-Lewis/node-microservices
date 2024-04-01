import { Fabricate } from 'fabricate.js';
import { AppState } from '../types';

declare const fabricate: Fabricate<AppState>;

/**
 * ItemPill component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Item icon.
 * @param {string} props.text - Item text.
 * @param {boolean} [props.disabled] - If the item disabled.
 * @returns {HTMLElement} Fabricate component.
 */
const ItemPill = ({
  src,
  text,
  disabled,
}: {
  src: string,
  text: string,
  disabled?: boolean,
}) => fabricate('Row')
  .setStyles(({ palette }) => ({
    cursor: 'default',
    borderRadius: '15px',
    backgroundColor: disabled ? palette.grey3 : palette.grey5,
    margin: '3px',
    alignItems: 'center',
    padding: '2px 6px',
    height: 'fit-content',
  }))
  .setChildren([
    fabricate('Image', { src })
      .setStyles({
        width: '18px',
        height: '18px',
        filter: `brightness(${disabled ? '0.4' : '1'})`
      }),
    fabricate('Text')
      .setStyles(({ palette }) => ({
        fontSize: '0.9rem',
        fontFamily: 'monospace',
        color: disabled ? palette.grey5 : 'white',
      }))
      .setText(text),
  ]);

export default ItemPill;
