/**
 * TextButton component.
 *
 * @returns {HTMLElement}
 */
fabricate.declare('TextButton', () => fabricate('Button', {
  color: 'white',
  backgroundColor: Theme.colors.primary,
})
  .setStyles({ height: '25px', fontSize: '1rem' }));
