/**
 * IPTextBox component.
 *
 * @returns {HTMLElement}
 */
const IPTextBox = () =>
  fab.TextInput({
    placeholder: 'IP Address...',
    color: 'white',
    backgroundColor: '#0003',
  })
  .withStyles({
    width: '200px',
    height: '30px',
    border: 0,
    borderRadius: '3px',
    margin: '10px',
    fontSize: '1.1rem',
    paddingLeft: '5px',
  });
