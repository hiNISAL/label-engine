import { useCanvas } from '@leafer-ui/node';
import * as skia from 'skia-canvas';
// const skia = require('skia-canvas');

useCanvas('skia', skia);

export { setPuppeteerLaunchOptions } from '../lib/html2image';
export { LabelRenderer, useLabel, getLabel } from '../lib';
