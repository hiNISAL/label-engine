import Koa from 'koa';
import Router from 'koa-router';
import cors from 'koa-cors';
import koaBody from 'koa-body';
import { LabelRenderer, getLabel } from '../Renderer/server';
import 'dotenv/config';

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(koaBody());

router.post('/label/render', async (ctx) => {
  const { label_id, fields } = ctx.request.body;

  const renderer = new LabelRenderer({
    label: getLabel(label_id),
  });

  await renderer.setData(fields);

  const res = await renderer.toPNG();

  const body = {
    data: {
      image: res.data,
    },
    code: 0,
  };

  ctx.body = body;
});

router.post('/label/render/leafer', async (ctx) => {
  const { dsl } = ctx.request.body;

  const renderer = new LabelRenderer({
    dsl,
  });

  const res = await renderer.toPNG();

  const body = {
    data: {
      image: res.data,
    },
    code: 0,
  };

  ctx.body = body;
});

app.use(router.routes());

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
