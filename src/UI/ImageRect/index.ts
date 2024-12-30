import { Rect, registerUI } from '@leafer-ui/node';

@registerUI()
export class ImageRect extends Rect {
  public get __tag() {
    return 'ImageRect';
  }
}
