import { useCanvas } from '@leafer-ui/node';
import skia from 'skia-canvas';

useCanvas('skia', skia);

export { setPuppeteerLaunchOptions } from '../lib/html2image';
export { LabelRenderer, useLabel, getLabel } from '../lib';
