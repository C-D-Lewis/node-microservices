/**
 * IconButton component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const IconButton = ({ iconSrc }) =>
  fab.Image({
    src: iconSrc,
    width: '26px',
    height: '26px',
  })
  .withStyle({
    backgroundColor: '#0003',
    padding: '3px',
    borderRadius: '3px',
    marginRight: '5px',
    cursor: 'pointer',
  });
