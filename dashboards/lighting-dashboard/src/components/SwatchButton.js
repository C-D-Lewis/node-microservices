/**
 * SwatchButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.backgroundColor - Background color.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const SwatchButton = ({ backgroundColor }) => fabricate('div')
  .asFlex('row')
  .withStyles({
    minWidth: '30px',
    height: '30px',
    flex: 1,
    backgroundColor,
    margin: '3px',
    borderRadius: '5px',
    cursor: 'pointer',
  });
