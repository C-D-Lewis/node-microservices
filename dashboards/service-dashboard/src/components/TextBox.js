/**
 * TextBox component.
 */
fabricate.declare('TextBox', ({ placeholder = '' } = {}) => fabricate('TextInput', { placeholder, color: 'black' })
  .setStyles({
    height: '25px',
    border: '0',
    fontSize: '1rem',
    padding: '5px 5px 2px 10px',
    margin: '10px 5px',
    outline: 'none',
    fontFamily: 'monospace',
  }));
