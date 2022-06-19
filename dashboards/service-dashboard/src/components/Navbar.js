/**
 * NavbarIcon component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const NavbarIcon = ({ src }) =>
  fab.Image({
    src,
    width: 50,
    height: 'auto',
  });

/**
 * NavbarTitle component.
 *
 * @returns {HTMLElement}
 */
const NavbarTitle = () =>
  fab('div')
    .withStyles({
      color: 'white',
      fontSize: '1.5rem',
      marginLeft: 15,
      fontWeight: 'bold',
      cursor: 'default',
  });

/**
 * NavbarContent component.
 *
 * @returns {HTMLElement}
 */
const NavbarContent = () =>
  fab.Row()
    .withStyles({
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingLeft: 35,
    });

/**
 * NavBar component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const NavBar  = ({ icon, title, children }) =>
  fab.Row()
    .withStyles({
      flexWrap: 'wrap',
      width: '100%',
      minHeight: 55,
      backgroundColor: Colors.primary,
      alignItems: 'center',
      boxShadow: '0px 2px 3px 1px #5557',
      paddingLeft: 20,
    })
    .withChildren([
      NavbarIcon({ src: icon }),
      NavbarTitle().setText(title),
      NavbarContent().withChildren(children),
    ]);
