const createApp = require('./app');
const config = require('./config/environment');

const app = createApp();

app.listen(config.port, () => {
  console.log(`Backend server berjalan di port ${config.port}`);
});
