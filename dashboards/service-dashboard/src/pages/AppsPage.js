/* global AppCard ResponseLog */

/**
 * AppsPage component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const AppsPage = () => fab.Row()
  .withStyles({ height: '100vh', alignItems: 'flex-start' })
  .withChildren([
    fab.Row()
      .withStyles({ flexWrap: 'wrap', paddingTop: '15px', flex: 2 })
      .watchState((el, { apps }) => {
        el.clear();
        el.addChildren([...apps.map(({ app }) => AppCard({ app }))]);
      }, ['apps']),
    ResponseLog(),
  ]);
