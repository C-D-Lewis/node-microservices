/**
 * SwatchButton component.
 */
fabricate.declare('SwatchButton', ({ backgroundColor }) => fabricate('div')
  .asFlex('row')
  .withStyles({
    minWidth: '30px',
    height: '30px',
    flex: 1,
    backgroundColor,
    margin: '3px',
    borderRadius: '5px',
    cursor: 'pointer',
  }));
