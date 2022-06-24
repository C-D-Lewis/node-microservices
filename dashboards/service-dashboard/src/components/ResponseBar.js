/* global Fonts */

/**
 * ResponseBar component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const ResponseBar = () => fab('div')
  .withStyles({
    fontFamily: Fonts.code,
    position: 'relative',
    bottom: 0,
    width: '100%',
    minHeight: 30,
    backgroundColor: '#333',
    color: 'white',
    alignItems: 'center',
    marginBottom: '10px',
  })
  .watchState(
    (el, { responseBarText }) => {
      el.addStyles({ padding: responseBarText.length ? '5px' : '0px' });
      el.setText(responseBarText);
    },
    ['responseBarText'],
  );
