import { Leafer, App, Rect, Text, Platform, RenderEvent, Frame, Image } from 'leafer-ui';
import type { IImageInputData, IRectInputData, ITextInputData, UI } from 'leafer-ui';
// import { Richtext } from './UI/Richtext';
import { Flow } from '@leafer-in/flow';
// import { ImageRect } from './UI/ImageRect';
import { DotMatrix } from 'leafer-x-dot-matrix';
// import { App } from '@leafer-ui/core';
import { Snap } from 'leafer-x-snap';
import '@leafer-in/editor';
import '@leafer-in/text-editor';
import { v4 } from 'uuid';

export type { Rect };

// 启用吸附功能
// snap.enable(true);

// const tree = app.tree;

// tree.add(Rect.one({ fill: '#FEB027', editable: true }, 100, 100));
// tree.add(Rect.one({ fill: '#FFE04B', editable: true }, 300, 100));

interface DrawerCoreOptions {
  view: string;
  width?: number;
  height?: number;
}

export class DrawerCore {
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------

  public leaferApp: App = null as unknown as App;

  public dotMatrix: DotMatrix = null as unknown as DotMatrix;

  public snap: Snap = null as unknown as Snap;

  // -------------------------------------------------------------------------

  public elementMap = new Map<string, UI>();

  // -------------------------------------------------------------------------

  public options: DrawerCoreOptions;

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------

  constructor(options: DrawerCoreOptions) {
    this.options = options;

    this.create();
  }

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------

  public create() {
    this.leaferApp = new App({
      view: this.options.view,
      editor: {},
      width: this.options.width,
      height: this.options.height,
    });

    this.dotMatrix = new DotMatrix(this.leaferApp, {
      dotSize: 1,
      dotMatrixGapMap: [10],
      dotColor: 'rgba(0, 0, 0, 0.15)',
    });

    this.snap = new Snap(this.leaferApp, {
      snapSize: 10,
      strokeWidth: 2,
    });
  }

  // -------------------------------------------------------------------------

  public enableDotMatrix(enable: boolean = true) {
    this.dotMatrix.enableDotMatrix(enable);
  }

  // -------------------------------------------------------------------------

  public enableSnap(enable: boolean = true) {
    this.snap.enable(enable);
  }

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------

  private addToTree = <T extends { data: { id?: string } }>(data: T) => {
    if (!data.data.id) {
      data.data.id = v4();
    }

    this.leaferApp.tree.add(data);

    this.elementMap.set(data.data.id, data as unknown as UI);
  };

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // ADD SHAPES
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------

  public addRect(options: IRectInputData) {
    const _ = new Rect(options);

    this.addToTree(_);
  }

  public addText(options: ITextInputData) {
    const _ = new Text(options);

    this.addToTree(_);
  }

  public addImage(options: IImageInputData) {
    const _ = new Image(options);

    this.addToTree(_);
  }

  public addRectImage(options: IRectInputData) {
    const _ = new Rect(options);

    this.addToTree(_);
  }

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------

  public exportJSON() {
    return this.leaferApp.tree.toJSON();
  }
}
