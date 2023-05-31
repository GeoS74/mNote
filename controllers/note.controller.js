const fs = require('fs/promises');
const sharp = require('sharp');
const path = require('path');
const Note = require('../models/Note');
const mapper = require('../mappers/note.mapper');
const logger = require('../libs/logger');

module.exports.get = async (ctx) => {
  const note = await _getNote(ctx.params.id);

  if (!note) {
    ctx.throw(404, 'note not found');
  }
  ctx.status = 200;
  ctx.body = mapper(note);
};

module.exports.add = async (ctx) => {
  ctx.request.body.files = await _processingImages(ctx.images);

  const note = await _addNote(ctx.request.body);

  ctx.status = 201;
  ctx.body = mapper(note);
};

module.exports.update = async (ctx) => {
  ctx.request.body.files = await _processingImages(ctx.images);

  const note = await _updateNote(ctx.params.id, ctx.request.body);

  if (!note) {
    ctx.throw(404, 'note not found');
  }
  ctx.status = 200;
  ctx.body = mapper(note);
};

module.exports.delete = async (ctx) => {
  const note = await _deleteNote(ctx.params.id);

  if (!note) {
    ctx.throw(404, 'note not found');
  }

  /* delete images */
  if (note.files) {
    _deleteImages(note.files);
  }

  ctx.status = 200;
  ctx.body = mapper(note);
};

// удаление прикрепленного файла при редактировании документа
module.exports.deleteAtatchedFile = async (ctx) => {
  let note = await _getNote(ctx.params.id);

  if (!note) {
    ctx.throw(404, 'note not found');
  }

  note = await _updateAttachedFileList(note._id, { fileName: ctx.request.body.fileName });

  // /* delete images */
  _deleteImages([{ fileName: ctx.request.body.fileName }]);

  ctx.status = 200;
  ctx.body = mapper(note);
};

function _getNote(id) {
  return Note.findById(id);
}

function _addNote({
  title,
  message,
  isPublic,
  files,
}) {
  return Note.create({
    title,
    message,
    isPublic,
    files,
  });
}

function _updateNote(id, {
  title,
  message,
  isPublic,
  files,
}) {
  return Note.findByIdAndUpdate(
    id,
    {
      title,
      message,
      isPublic,
      $push: { files },
    },
    {
      new: true,
    },
  );
}

function _deleteNote(id) {
  return Note.findByIdAndDelete(id);
}

function _updateAttachedFileList(id, files) {
  return Note.findByIdAndUpdate(
    id,
    { $pull: { files } },
    { new: true },
  );
}

function _deleteImages(files) {
  for (const file of files) {
    fs.unlink(`./files/images/${file.fileName}`)
      .catch((error) => {
        if (error.code === 'ENOENT') {
          logger.error('попытка удалить не существующий файл');
          return;
        }
        logger.error(error);
      });
  }
}

async function _processingImages(images) {
  const res = [];
  for (const image of images) {
    await _resizePhoto(image.filepath, path.join(__dirname, `../files/images/${image.newFilename}`))
      .catch((error) => logger.error(`error resizing image: ${error.message}`));

    _deleteFile(image.filepath);

    // перемещение файла без обработки
    // await fs.rename(image.filepath, path.join(__dirname, `../files/images/${image.newFilename}`))
    //   .catch((error) => logger.error(error.mesasge));

    res.push({
      originalName: image.originalFilename,
      fileName: image.newFilename,
    });
  }
  return res;
}

async function _resizePhoto(filepath, newFilename) {
  return sharp(filepath)
    .resize({
      width: 350,
      height: 350,
    })
    .toFile(newFilename);
}

function _deleteFile(fpath) {
  fs.unlink(fpath)
    .catch((error) => logger.error(`delete file: ${error.message}`));
}

/**
 * поиск пользователя
 *
 * возможные параметры запроса:
 * - search
 * - last
 * - limit
 * - public
 *
 */

module.exports.search = async (ctx) => {
  const data = _makeFilterRules(ctx.query);
  const notes = await _searchNote(data);

  ctx.body = notes.map((note) => (mapper(note)));
  ctx.status = 200;
};

async function _searchNote(data) {
  return Note.find(data.filter, data.projection)
    .sort({
      _id: -1,
      //  score: { $meta: "textScore" } //сортировка по релевантности
    })
    .limit(data.limit);
}

function _makeFilterRules({
  search,
  lastId,
  limit,
  isPublic,
}) {
  const filter = {};
  const projection = {};

  if (search) {
    filter.$text = {
      $search: search,
      $language: 'russian',
    };

    projection.score = { $meta: 'textScore' }; // добавить в данные оценку текстового поиска (релевантность)
  }

  if (lastId) {
    filter._id = { $lt: lastId };
  }

  if (isPublic) {
    filter.isPublic = true;
  }

  return { filter, projection, limit };
}
