/**
 * AppsPage component.
 */
fabricate.declare('AppsPage', () => fabricate('Row')
  .setStyles({ height: '100vh', alignItems: 'flex-start' })
  .setChildren([
    fabricate('Row')
      .setStyles({ flexWrap: 'wrap', paddingTop: '15px', flex: 2 })
      .onUpdate((el, { apps }) => {
        el.setChildren([...apps.map(({ app }) => fabricate('AppCard', { app }))]);
      }, ['apps']),
    fabricate('ResponseLog'),
  ]));
