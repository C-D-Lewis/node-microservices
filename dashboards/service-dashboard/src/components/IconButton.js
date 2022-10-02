/**
 * IconButton component.
 */
fabricate.declare('IconButton', ({ src }) => fabricate('Image', { src })
  .setStyles({
    width: '26px',
    height: '26px',
    backgroundColor: '#0003',
    padding: '3px',
    borderRadius: '3px',
    marginRight: '5px',
    cursor: 'pointer',
  }));
