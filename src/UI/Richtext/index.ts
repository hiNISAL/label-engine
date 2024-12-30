import { Text, registerUI } from '@leafer-ui/node';

@registerUI()
export class Richtext extends Text {
  public get __tag() {
    return 'Richtext';
  }
}

interface RichTextToImageElDslOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  url?: string;
}
export const richTextToImageElDsl = (options: RichTextToImageElDslOptions) => {
  return {
    tag: 'ImageRect',
    text: '',
    ...options,
    data: {},
    fill: {
      type: 'image',
      url: options.url,
      mode: 'stretch',
    },
  };
};
