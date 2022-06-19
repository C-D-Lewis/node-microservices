/**
 * LeftColumn component.
 *
 * @returns {HTMLElement}
 */
const LeftColumn = () =>
  fab.Column()
    .withStyle({
      flex: 1,
      backgroundColor: 'white',
      width: '100%',
      alignItems: 'flex-start',
      borderRight: 'solid 1px #0004',
      boxShadow: '0px 2px 3px 1px #5557',
    });
