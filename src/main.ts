import { DrawerCore } from './Drawer/Core/index';

const drawer = new DrawerCore({ view: 'app' });

drawer.enableDotMatrix(true);
drawer.enableSnap(true);

drawer.addRect({ fill: '#FEB027', editable: true, x: 100, y: 100, width: 100, height: 100 });
drawer.addRect({ fill: '#FEB027', editable: true, x: 100, y: 100, width: 100, height: 100 });

// drawer.addText({
//   text: 'Hello World',
//   fontSize: 20,
//   editable: true,
//   fill: '#000',
//   x: 100,
//   y: 100,
// });

// drawer.addImage({
//   url: 'https://static.clewm.net/cli/images/cli_logo_new.png',
//   x: 100,
//   y: 100,
//   width: 100,
//   editable: true,
//   height: 100,
// });

// drawer.addRectImage({
//   fill: {
//     type: 'image',
//     url: 'https://static.clewm.net/cli/images/cli_logo_new.png',
//     mode: 'stretch',
//   },
//   editable: true,
//   x: 100,
//   y: 100,
//   width: 100,
// });

console.log(drawer);
