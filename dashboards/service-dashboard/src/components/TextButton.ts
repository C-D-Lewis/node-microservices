import { Fabricate } from "../../node_modules/fabricate.js/types/fabricate";
import { AppState } from "../types";
import Theme from "../theme";

declare const fabricate: Fabricate<AppState>;

/**
 * TextButton component.
 *
 * @returns {HTMLElement}
 */
const TextButton = () => fabricate('Button', {
  color: 'white',
  backgroundColor: Theme.colors.primary,
})
  .setStyles({ height: '25px', fontSize: '1rem' });

export default TextButton;
