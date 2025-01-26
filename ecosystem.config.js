module.exports = {
  apps: [
    {
      name: 'label-engine',
      script: './src/http/index.ts',
      interpreter: './node_modules/.bin/ts-node',
      exec_mode: 'cluster',
    },
  ],
};
