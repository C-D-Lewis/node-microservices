/**
 * IconButton component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const IconButton = ({ src }) => fab.Image({
  src,
  width: '26px',
  height: '26px',
})
  .withStyles({
    backgroundColor: '#0003',
    padding: '3px',
    borderRadius: '3px',
    marginRight: '5px',
    cursor: 'pointer',
  });
