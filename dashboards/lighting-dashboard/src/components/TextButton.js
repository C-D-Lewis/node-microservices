/**
 * TextButton component.
 */
fabricate.declare('TextButton', ({
  label,
  color,
  backgroundColor,
} = {}) => fabricate.Button({
  text: label,
  color,
  backgroundColor,
  highlight: false,
})
  .withStyles({
    minWidth: '10px',
    height: '30px',
    padding: '5px',
    margin: '5px',
    borderRadius: '5px',
    textAlign: 'center',
    justifyContent: 'center',
  }));
