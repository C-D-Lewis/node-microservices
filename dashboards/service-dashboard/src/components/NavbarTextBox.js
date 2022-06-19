/**
 * NavbarTextBox component.
 *
 * @returns {HTMLElement}
 */
const NavbarTextBox = ({ placeholder, onChange }) =>
  fab.TextInput({
    placeholder,
    color: 'white',
    backgroundColor: '#0003',
  })
  .withStyle({
      height: '30px',
      border: 0,
      borderRadius: '3px',
      margin: '10px',
      fontSize: '1.1rem',
      paddingLeft: '5px',
    })
  .onChange((el, value) => onChange(value));
