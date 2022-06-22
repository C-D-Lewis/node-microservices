/**
 * TextBox component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const TextBox  = ({ placeholder = '' } = {}) => fab.TextInput({
  placeholder,
  color: 'black',
})
  .withStyles({
    height: '25px',
    border: '0',
    borderBottom: '2px solid #0005',
    fontSize: '1.1rem',
    paddingLeft: '10px',
    margin: '10px 15px',
  });
