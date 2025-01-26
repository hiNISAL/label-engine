import { Leafer, Group, Platform } from '@leafer-ui/node';
// import { Canvas, Image } from 'skia-canvas';
import type { Label, Padding } from '../../types/Label';
import { html2image } from './html2image';
import { richTextToImageElDsl } from '../../UI/Richtext';
import '@leafer-in/flow';
import '../../UI/ImageRect';

// -------------------------------------------------------------------------

const ROOT_FLOW_CONTAINER_KEY = '__ROOT_FLOW_CONTAINER__';

// -------------------------------------------------------------------------

const labelTemplateMap: Record<string, Label> = {};

export const useLabel = (id: string, data: Label) => {
  labelTemplateMap[id] = data;
};

export const getLabel = (id: string): Label => {
  return labelTemplateMap[id];
};

// -------------------------------------------------------------------------

const flatAllChildren = (dsl: Record<string, any>) => {
  const result: Record<string, any>[] = [];

  const traverse = (node: Record<string, any>) => {
    result.push(node);

    if (Array.isArray(node.children)) {
      node.children.forEach((child: Record<string, any>) => {
        traverse(child);
      });
    }
  };

  traverse(dsl);
  return result;
};

const replaceChildByDataKey = (dsl: Record<string, any>, key: string, newChild: any) => {
  const traverse = (children: any[]) => {
    if (!children) return;

    if (!Array.isArray(children)) return;

    children.forEach((child: any, idx) => {
      if (child?.data?.key === key) {
        children[idx] = newChild;
      }

      traverse(child.children);
    });
  };

  traverse(dsl.children);
};

const removeBlankChild = (dsl: Record<string, any>) => {
  const traverse = (children: any[]) => {
    if (!children) return;

    const len = children.length;
    let i = len - 1;
    for (; i >= 0; i--) {
      const child = children[i];

      if (child?.tag === 'Text') {
        if (child.text === '') {
          children.splice(i, 1);
        }
      } else if (child?.tag === 'ImageRect') {
        if (child.fill.url === '') {
          children.splice(i, 1);
        }
      }

      traverse(child.children);
    }
  };

  traverse(dsl.children);
};

// -------------------------------------------------------------------------

Platform.image.crossOrigin = 'anonymous';

interface Options {
  label?: Label;
  dsl?: Record<string, any>;
  width?: number;
  height?: number;
}

export class LabelRenderer {
  public label: Label;

  public leafer: Leafer;

  public dsl: Record<string, any>;

  public groupRef: Group;

  // public renderQueue: number[] = [];
  private backgroundColor = 'white';

  private flatChildren: any[] = [];

  private flatChildrenMap: Record<string, any> = {};

  // private padding: [number, number, number, number] = [0, 0, 0, 0];

  constructor(options: Options) {
    if (options.label) {
      this.label = options.label;
      this.dsl = JSON.parse(this.label.dsl);

      this.label.width = options.width || this.label.width;
      this.label.height = options.height || this.label.height;
    } else {
      this.dsl = JSON.parse(options.dsl as unknown as string);

      this.label = {
        dsl: options.dsl as unknown as string,
        width: options.width || this?.dsl?.width,
        height: options.height || this?.dsl?.height,
      };
    }

    this.leafer = new Leafer(
      {
        width: this.label.width,
        height: this.label.height,
      },
      // JSON.parse(this.label.dsl),
    );

    const group = new Group();
    this.groupRef = group;
    this.leafer.add(group);

    group.set(this.dsl);

    // this.leafer.on(RenderEvent.BEFORE, () => {
    //   console.log('before');
    //   this.renderQueue.push(1);
    // });

    // this.leafer.on(RenderEvent.AFTER, () => {
    //   console.log('after');
    //   this.renderQueue.shift();
    // });

    this.toFlatChildren();
  }

  async setLabelBackground(background: string) {
    this.backgroundColor = background;
  }

  // async setLabelPadding(padding: Padding) {
  //   const children = this.flatChildrenMap;

  //   const root = children[ROOT_FLOW_CONTAINER_KEY];
  //   root.padding = padding;

  //   this.padding = padding;
  // }

  private toFlatChildren() {
    this.flatChildren = flatAllChildren(this.dsl);

    const keyToValue: Record<string, any> = {};

    this.flatChildren.forEach((child) => {
      const name = child?.data?.key;

      keyToValue[name] = child;
    });

    this.flatChildrenMap = keyToValue;
  }

  async setData(
    data: Record<string, any>,
    labelOptions: {
      padding?: Padding;
    } = {},
  ) {
    const keyToValue = this.flatChildrenMap;

    for (const [key, dataItem] of Object.entries(data)) {
      const child = keyToValue[key];

      if (!child) continue;

      if (child.tag === 'Text') {
        child.text = dataItem.value;
      } else if (child.tag === 'Richtext') {
        const richTextDsl = richTextToImageElDsl({
          x: child.x,
          y: child.y,
          width: child.width,
          height: child.height,
        });

        richTextDsl.data = child.data;

        replaceChildByDataKey(this.dsl, key, richTextDsl);

        const imageBase64 = await html2image({
          html: dataItem.value,
          width: richTextDsl.width,
          height: richTextDsl.height,
          toBase64: true,
          backgroundColor: this.backgroundColor,
          insertToHeader: child.data?.presetHtml?.header,
        });

        richTextDsl.fill.url = imageBase64.image as string;
      } else if (child.tag === 'ImageRect') {
        child.fill.url = dataItem.value;
      }

      const layout = dataItem.layout || {};

      if (layout.padding) {
        child.padding = layout.padding;
      }
    }

    if (labelOptions.padding) {
      const root = this.flatChildrenMap[ROOT_FLOW_CONTAINER_KEY];
      root.padding = labelOptions.padding;
    }

    removeBlankChild(this.dsl);

    this.groupRef.set(this.dsl);

    this.toFlatChildren();

    // await new Promise(resolve => {
    //   const timer = setInterval(() => {
    //     if (this.renderQueue.length === 0) {
    //       clearInterval(timer);
    //       resolve(null);
    //     }
    //   }, 16);
    // });
  }

  // private async resultImageAddPadding(
  //   image: string,
  //   width: number,
  //   height: number
  // ) {
  //   const padding = this.padding.map(item => item * 2);
  //   const img = new Image();
  //   img.src = image;

  //   const canvas = new Canvas(
  //     width + padding[0] + padding[2],
  //     height + padding[1] + padding[3]
  //   );
  //   const ctx = canvas.getContext('2d');

  //   ctx.drawImage(img, padding[0], padding[3], width, height);

  //   const backgroundColor = this.backgroundColor;

  //   if (backgroundColor) {
  //     ctx.fillStyle = backgroundColor;
  //     ctx.fillRect(0, 0, padding[0], canvas.height);
  //     ctx.fillRect(canvas.width - padding[2], 0, padding[2], canvas.height);
  //     ctx.fillRect(0, 0, canvas.width, padding[1]);
  //     ctx.fillRect(0, canvas.height - padding[3], canvas.width, padding[3]);
  //   }

  //   return {
  //     data: await canvas.toDataURL('png'),
  //     width: canvas.width,
  //     height: canvas.height,
  //   };
  // }

  async toPNG() {
    return this.leafer.export('png', {
      fill: this.backgroundColor,
      pixelRatio: 2,
      trim: false,
    });
    // const exp = await this.leafer.export('png', {
    //   fill: this.backgroundColor,
    //   pixelRatio: 2,
    //   trim: false,
    // });

    // const result = await this.resultImageAddPadding(
    //   exp.data,
    //   exp.width,
    //   exp.height
    // );

    // return {
    //   ...exp,
    //   ...result,
    // };
  }

  toJPEG() {
    return this.leafer.export('jpg', {
      fill: this.backgroundColor,
      pixelRatio: 2,
    });
  }

  toJPEGBlob() {
    return this.leafer.export('jpg', {
      blob: true,
      fill: this.backgroundColor,
      pixelRatio: 2,
    });
  }
}
