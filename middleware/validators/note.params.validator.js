const fs = require('fs/promises');
const { isValidObjectId } = require('mongoose');
const logger = require('../../libs/logger');

module.exports.title = async (ctx, next) => {
  if (!_checkTitle(ctx.request?.body?.title)) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'invalid title');
  }

  await next();
};

module.exports.objectId = async (ctx, next) => {
  if (!_checkObjectId(ctx.params.id)) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'invalid doc id');
  }

  await next();
};

module.exports.files = async (ctx, next) => {
  if (Object.keys(ctx.request.files).indexOf('images') === -1) {
    _deleteFile(ctx.request.files);
    ctx.images = [];
    await next();
    return;
  }

  const files = Array.isArray(ctx.request.files.images)
    ? ctx.request.files.images : [ctx.request.files.images];

  for (const file of files) {
    if (!_checkMimeType(file.mimetype)) {
      _deleteFile(ctx.request.files);
      ctx.throw(400, 'bad mime type');
      return;
    }
  }

  ctx.images = files;

  await next();
};

module.exports.email = async (ctx, next) => {
  if (!_checkEmail(ctx?.user?.email)) {
    ctx.throw(400, 'invalid email');
  }

  await next();
};

function _checkEmail(email) {
  return !!email;
}

function _checkMimeType(mimeType) {
  if (/^image\/\w+/.test(mimeType)) {
    return true;
  }
  return false;
}

function _checkObjectId(id) {
  return isValidObjectId(id);
}

function _checkTitle(title) {
  return title?.trim();
}

function _deleteFile(files) {
  if (files) {
    for (const file of Object.values(files)) {
      // received more than 1 file in any field with the same name
      if (Array.isArray(file)) {
        _deleteFile(file);
      } else {
        fs.unlink(file.filepath)
          .catch((error) => logger.error(error.mesasge));
      }
    }
  }
}
