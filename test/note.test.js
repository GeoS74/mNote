const { expect } = require('chai');
const fetch = require('node-fetch');
const fs = require('fs/promises');
const path = require('path');
const connection = require('../libs/connection');
require('dotenv').config({ path: '../secrets.env' });

const config = require('../config');
const app = require('../app');
const Note = require('../models/Note');
const logger = require('../libs/logger');

if (config.node.env !== 'dev') {
  logger.warn('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

describe('/test/brands.test.js', () => {
  let _server;

  before(async () => {
    _server = app.listen(config.server.port);
  });

  after(async () => {
    await Note.deleteMany({});
    await fs.rm(path.join(__dirname, '../files'), { recursive: true, force: true })
    connection.close();
    _server.close();
  });

  describe('note CRUD', () => {
    it('create note', async () => {
      const note = {};

      const optional = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(note),
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/mnote`, optional)
        .then(_getData);
    });

    it('read note', async () => {

    });

    it('update note', async () => {

    });

    it('delete note', async () => {

    });

  });
});

async function _getData(response) {
  return {
    status: response.status,
    data: await response.json(),
  };
}