/**
 * LED component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const LED = () => fabricate('div')
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
  });
