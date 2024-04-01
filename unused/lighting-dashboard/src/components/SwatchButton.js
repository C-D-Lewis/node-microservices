/**
 * SwatchButton component.
 */
fabricate.declare('SwatchButton', ({ backgroundColor }) => fabricate('Row')
  .setStyles({
    minWidth: '30px',
    height: '30px',
    flex: 1,
    backgroundColor,
    margin: '3px',
    borderRadius: '5px',
    cursor: 'pointer',
  }));
