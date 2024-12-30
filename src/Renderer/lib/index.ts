import { Leafer, Rect, Group, useModule, Platform } from '@leafer-ui/node';
import type { Label } from '../../types/Label';
import { html2image } from './html2image';
import { richTextToImageElDsl } from '../../UI/Richtext';
import '@leafer-in/flow';
import '../../UI/ImageRect';

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

// -------------------------------------------------------------------------

Platform.image.crossOrigin = 'anonymous';

interface Options {
  label: Label;
}

export class LabelRenderer {
  public label: Label;

  public leafer: Leafer;

  public dsl: Record<string, any>;

  public groupRef: Group;

  constructor(options: Options) {
    this.label = options.label;

    this.dsl = JSON.parse(this.label.dsl);

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
  }

  async setData(data: Record<string, any>) {
    const children = flatAllChildren(this.dsl);

    const keyToValue: Record<string, any> = {};

    children.forEach((child) => {
      const name = child?.data?.key;

      keyToValue[name] = child;
    });

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
        });

        richTextDsl.fill.url = imageBase64.image as string;
      } else if (child.tag === 'ImageRect') {
        child.fill.url = dataItem.value;
      }
    }

    this.groupRef.set(this.dsl);
  }

  toPNG() {
    return this.leafer.export('png');
  }
}
