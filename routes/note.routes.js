const { readdir, mkdir } = require('node:fs/promises');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const serve = require('koa-static');
const mount = require('koa-mount');

const controller = require('../controllers/note.controller');
const validator = require('../middleware/validators/note.params.validator');
const validatorSearch = require('../middleware/validators/search.params.validator');
const accessCheck = require('../middleware/access.check');

(async () => {
  try {
    await readdir('./files/images');
  } catch (error) {
    mkdir('./files/images', {
      recursive: true,
    });
  }
})();

const optional = {
  formidable: {
    uploadDir: './files',
    allowEmptyFiles: false,
    minFileSize: 1,
    multiples: true,
    hashAlgorithm: 'md5',
    keepExtensions: true,
  },
  multipart: true,
};

const router = new Router({ prefix: '/api/mnote' });

/**
 * все роуты доступны только при наличии access токена
 *
 */

router.use(
  accessCheck,
  // validator.email,
);

router.get(
  '/search/note',
  validatorSearch.searchString,
  validatorSearch.lastId,
  validatorSearch.limit,
  validatorSearch.isPublic,

  controller.search,
);

router.get(
  '/:id',
  validator.objectId,
  controller.get,
);

router.post(
  '/',
  koaBody(optional),
  validator.title,
  validator.files,
  validator.isPublic,
  controller.add,
);
router.patch(
  '/:id',
  koaBody(optional),
  validator.objectId,
  validator.title,
  validator.files,
  validator.isPublic,
  controller.update,
);
router.delete(
  '/:id',
  validator.objectId,
  controller.delete,
);

router.patch(
  '/file/:id',
  koaBody(optional),
  validator.objectId,
  controller.deleteAtatchedFile,
);

module.exports.routes = router.routes();

// static files
module.exports.static = mount('/api/informator/mnote/images', serve('./files/images'));
