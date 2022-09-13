/**
 * LED component.
 */
fabricate.declare('LED', () => fabricate('div')
  .withStyles({
    width: '15px',
    height: '15px',
    borderRadius: '9px',
    marginRight: '5px',
    backgroundColor: 'black',
  })
  .then((el) => {
    el.setConnected = (connected) => {
      el.style.backgroundColor = connected ? Theme.Colors.statusOk : Theme.Colors.statusDown;
    };
  }));
