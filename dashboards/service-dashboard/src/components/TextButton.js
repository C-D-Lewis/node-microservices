/* global Theme */

/**
 * TextButton component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
fabricate.declare('TextButton', () => fabricate.Button({ color: 'white', backgroundColor: Theme.colors.primary })
  .withStyles({ height: '25px', fontSize: '1.1rem' }));
