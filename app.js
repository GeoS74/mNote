const Koa = require('koa');
const cors = require('@koa/cors');

const config = require('./config');
const errorCatcher = require('./middleware/error.catcher');
const noteRoutes = require('./routes/note.routes');

const app = new Koa();

app.use(errorCatcher);
if (config.node.env === 'dev') {
  app.use(cors());
}

app.use(noteRoutes.routes);
app.use(noteRoutes.static);

module.exports = app;
