/**
 * LED component.
 */
fabricate.declare('LED', () => fabricate('div')
  .setStyles({
    width: '15px',
    height: '15px',
    borderRadius: '9px',
    marginRight: '5px',
    backgroundColor: 'black',
  })
  .onCreate((el) => {
    // Declare method remotely callable
    el.setConnected = (connected) => {
      el.style.backgroundColor = connected ? Theme.colors.statusOk : Theme.colors.statusDown;
    };
  }));
