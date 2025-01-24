import { DrawerCore } from '../Core/index';
import html from 'solid-js/html';
import { render } from 'solid-js/web';
import 'bootstrap/dist/css/bootstrap.min.css';

export const DrawerUI = () => {
  return html` <div></div> `;
};

export const renderDrawerUI = (root: HTMLElement) => {
  render(DrawerUI, root);
};
