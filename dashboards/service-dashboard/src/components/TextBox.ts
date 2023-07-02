import { Fabricate } from "../../node_modules/fabricate.js/types/fabricate";
import { AppState } from "../types";

declare const fabricate: Fabricate<AppState>;

/**
 * TextBox component.
 */
const TextBox = ({ placeholder = '' } = {}) =>
  fabricate('TextInput', { placeholder, color: 'black' })
    .setStyles({
      height: '25px',
      border: '0',
      fontSize: '1rem',
      padding: '5px 5px 2px 10px',
      margin: '10px 5px',
      outline: 'none',
      fontFamily: 'monospace',
    });

export default TextBox;
