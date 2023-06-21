/**
 * AppsPage component.
 */
fabricate.declare('AppsPage', () => fabricate('Row')
  .setStyles({
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    paddingTop: '15px',
  })
  .onUpdate((el, { apps }) => {
    el.setChildren([...apps.map(({ app }) => fabricate('AppCard', { app }))]);
  }, ['apps']));
