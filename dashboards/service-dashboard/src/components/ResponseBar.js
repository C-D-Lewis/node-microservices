/** Height of the bottom status bar */
const BOTTOM_BAR_HEIGHT = 30;

/**
 * ResponseBar component.
 *
 * @returns {HTMLElement}
 */
const ResponseBar = () =>
  fab('div')
    .withStyle({
      fontFamily: 'monospace',
      position: 'relative',
      bottom: 0,
      width: '100%',
      minHeight: BOTTOM_BAR_HEIGHT,
      padding: '5px',
      backgroundColor: '#333',
      color: 'white',
      alignItems: 'center',
    });
