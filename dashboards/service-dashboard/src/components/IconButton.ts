import { Fabricate } from "../../node_modules/fabricate.js/types/fabricate";
import Theme from "../theme";
import { AppState } from "../types";

declare const fabricate: Fabricate<AppState>;

/**
 * IconButton component.
 */
const IconButton = ({ src }: { src: string }) => fabricate('Image', { src })
  .setStyles({
    width: '26px',
    height: '26px',
    backgroundColor: Theme.colors.IconButton.background,
    padding: '3px',
    borderRadius: '3px',
    marginRight: '5px',
    cursor: 'pointer',
  });

export default IconButton;
