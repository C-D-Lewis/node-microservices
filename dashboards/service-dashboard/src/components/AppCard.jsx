/**
 * CardContainer component.
 *
 * @returns {HTMLElement}
 */
const CardContainer = () => fab.Card()
  .withStyle({
    // width: '375px',
    margin: '10px 0px 10px 20px',
    opacity: 0,
    visibility: 'hidden',
    transition: '0.6s',
  });

/**
 * CardTitle component.
 *
 * @param {object} props - Component props. 
 * @returns {HTMLElement}
 */
const CardTitle = () => fab.Text({ color: 'white' })
  .withStyle({
    fontSize: '1.2rem',
    flex: 1,
    color: 'white',
  });

/**
 * LEDText component.
 *
 * @param {object} props - Component props. 
 * @returns {HTMLElement}
 */
const LEDText = () => fab.Text({ color: Colors.lightGrey })
  .withStyle({
    fontSize: '0.9rem',
    paddingTop: 1,
  });

/**
 * LED component.
 *
 * @param {object} props - Component props. 
 * @returns {HTMLElement}
 */
const LED = ({ status }) =>
  <div style={{
    backgroundColor: Colors.statusDown,
    width: '15px',
    height: '15px',
    borderRadius: '9px',
    marginRight: '5px',
    backgroundColor: status.includes('OK') ? Colors.statusOk : Colors.statusDown,
  }}/>;

const Status = ({ data }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  }}>
    <LED status={data.status} />
    <LEDText>{data.status} ({data.port})</LEDText>
  </div>;

const CardTitleRow = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryDarkGrey,
    padding: '5px 15px',
  }}>
    {children}
  </div>;

const AppCard = ({ appData }) => {
  const container = CardContainer();

  return fab.Column()
    .withChildren([
      <CardTitleRow>
        <CardTitle>{appData.app}</CardTitle>
        <Status data={appData}/>
      </CardTitleRow>
      <AppControls data={appData} />
    ])
    .then((el) => {
      // Become visible shortly after creation
      setTimeout(() => {
        container.addStyles({
          opacity: visible ? 1 : 0,
          visibility: visible ? 'visible' : 'hidden',
        })
      }, 100);
    });
};
