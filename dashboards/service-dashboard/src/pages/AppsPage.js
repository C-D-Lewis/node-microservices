/* global AppCard Fonts */

/**
 * ResponseBar component.
 *
 * @returns {HTMLElement}
 */
const ResponseBar = () => fab('div')
  .withStyles({
    fontFamily: Fonts.code,
    position: 'relative',
    bottom: 0,
    width: '100%',
    minHeight: 30,
    backgroundColor: Colors.veryDarkGrey,
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

/**
 * AppsPage component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const AppsPage = () => fab.Column()
  .watchState((el, { apps }) => {
    el.clear();
    el.addChildren([
      ResponseBar(),
      fab.Row()
        .withStyles({ flexWrap: 'wrap' })
        .withChildren([...apps.map(({ app }) => AppCard({ app }))]),
    ]);
  }, ['apps']);
