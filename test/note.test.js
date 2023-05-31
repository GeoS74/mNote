const { expect } = require('chai');
const fetch = require('node-fetch');
const fs = require('fs/promises');
const path = require('path');
const FormData = require('form-data');
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
    await fs.rm(path.join(__dirname, '../files'), { recursive: true, force: true });
    connection.close();
    _server.close();
  });

  describe('note CRUD', () => {
    it('create note', async () => {
      let fd = new FormData();
      fd.append('title', 'foo');

      const optional = {
        method: 'POST',
        body: fd,
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/mnote`, optional)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 201').to.be.equal(201);
      _expectFieldState.call(this, response.data);

      fd = new FormData();
      optional.body = fd;

      response = await fetch(`http://localhost:${config.server.port}/api/mnote`, optional)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);
    });

    it('read note', async () => {
      const note = await Note.findOne({});

      let response = await fetch(`http://localhost:${config.server.port}/api/mnote/${note._id}`)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/mnote/${note._id}123`)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);
    });

    it('search note', async () => {
      let fd = new FormData();
      fd.append('title', 'test1');

      const optional = {
        method: 'POST',
        body: fd,
      };

      await fetch(`http://localhost:${config.server.port}/api/mnote`, optional);

      fd = new FormData();
      fd.append('title', 'test2');
      optional.body = fd;

      await fetch(`http://localhost:${config.server.port}/api/mnote`, optional);

      const response = await fetch(`http://localhost:${config.server.port}/api/mnote/search/note`)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает массив').that.is.an('array');
      _expectFieldState.call(this, response.data[0]);
    });

    it('update note', async () => {
      const note = await Note.findOne({});

      let fd = new FormData();
      fd.append('title', 'bar');
      fd.append('isPublic', '1');

      const optional = {
        method: 'PATCH',
        body: fd,
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/mnote/${note._id}`, optional)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);
      expect(response.data.title, 'сервер возвращает новый title').to.be.equal('bar');

      // если не переопределить FormData скрипт зависнет, я хз почему так...
      fd = new FormData();
      fd.append('title', 'baz');
      optional.body = fd;

      response = await fetch(`http://localhost:${config.server.port}/api/mnote/${note._id}123`, optional)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);
    });

    it('delete note', async () => {
      const note = await Note.findOne({});

      const optional = {
        method: 'DELETE',
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/mnote/${note._id}`, optional)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/mnote/${note._id}`, optional)
        .then(_getData);

      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);
    });
  });
});

async function _getData(response) {
  return {
    status: response.status,
    data: await response.json(),
  };
}

function _expectFieldState(data) {
  expect(data, 'сервер возвращает объект с полями id, title, message, isPublic, files, createdAt, updatedAt')
    .that.be.an('object')
    .to.have.keys(['id', 'title', 'message', 'isPublic', 'files', 'createdAt', 'updatedAt']);
}

function _expectErrorFieldState(data) {
  expect(data, 'сервер возвращает объект с описанием ошибки')
    .that.is.an('object')
    .to.have.property('error');
}
