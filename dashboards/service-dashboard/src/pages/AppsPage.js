/**
 * AppsPage component.
 */
fabricate.declare('AppsPage', () => fabricate.Row()
  .withStyles({ height: '100vh', alignItems: 'flex-start' })
  .withChildren([
    fabricate.Row()
      .withStyles({ flexWrap: 'wrap', paddingTop: '15px', flex: 2 })
      .watchState((el, { apps }) => {
        el.clear();
        el.addChildren([...apps.map(({ app }) => fabricate('AppCard', { app }))]);
      }, ['apps']),
    fabricate('ResponseLog'),
  ]));
