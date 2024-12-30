import { useCanvas } from '@leafer-ui/node';
import skia from 'skia-canvas';

useCanvas('skia', skia);

export { LabelRenderer, useLabel, getLabel } from '../lib';
