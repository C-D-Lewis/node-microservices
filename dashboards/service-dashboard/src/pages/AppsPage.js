/* global ResponseBar AppCard */

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
