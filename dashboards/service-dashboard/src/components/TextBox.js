/**
 * TextBox component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const TextBox  = ({ placeholder = '', style }) =>
  fab.TextInput({
    placeholder,
    color: 'black',
  })
  .withStyle({
    height: '30px',
    border: '0',
    borderBottom: '2px solid #0005',
    fontSize: '1.1rem',
    paddingLeft: '5px',
    margin: '0px 10px 10px 0px',
    ...style,
  });
