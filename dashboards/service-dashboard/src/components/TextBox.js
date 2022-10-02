/**
 * TextBox component.
 */
fabricate.declare('TextBox', ({ placeholder = '' } = {}) => fabricate('TextInput', { placeholder, color: 'black' })
  .setStyles({
    height: '25px',
    border: '0',
    borderBottom: '2px solid #0005',
    fontSize: '1.1rem',
    padding: '5px 5px 2px 10px',
    margin: '10px 5px',
    outline: 'none',
  }));
