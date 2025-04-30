import { Fabricate } from 'fabricate.js';
import { AppState } from '../types.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * ConsoleLine component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ConsoleLine = () => fabricate('Text')
  .setStyles(({ fonts, palette }) => ({
    color: 'white',
    fontFamily: fonts.code,
    padding: '3px',
    margin: '0px 0px 2px 0px',
    borderBottom: `1px solid ${palette.grey2}`,
    borderLeft: `5px solid ${palette.grey5}`,
    fontSize: '0.8rem',
    wordBreak: 'break-word',
  }));

/**
 * ConsoleView component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ConsoleView = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    position: 'fixed',
    right: '0',
    top: '100vh',
    left: '0',
    height: '60vh',
    backgroundColor: palette.grey1,
    width: '100vw',
    transition: '0.5s',
    overflowY: 'scroll',
    borderTop: `5px solid ${palette.grey5}`,
  }))
  .onUpdate((el, state, keys) => {
    const { consoleOpen, consoleLogs } = state;
    if (keys.includes('consoleOpen')) {
      el.setStyles({ top: consoleOpen ? '40vh' : '100vh' });
    }

    if (keys.includes('consoleLogs')) {
      el.setChildren(
        consoleLogs.map((log) => ConsoleLine().setText(log)),
        'ConsolePane',
      );
    }
  }, ['consoleOpen', 'consoleLogs']);

export default ConsoleView;
