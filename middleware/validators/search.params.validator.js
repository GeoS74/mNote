const { isValidObjectId } = require('mongoose');

module.exports.searchString = async (ctx, next) => {
  ctx.query.search = ctx.query.search || '';

  await next();
};

module.exports.lastId = async (ctx, next) => {
  if (ctx.query.last) {
    if (!isValidObjectId(ctx.query.last)) {
      ctx.throw(400, 'invalid last id');
    }
  }

  ctx.query.lastId = ctx.query.last;

  await next();
};

module.exports.limit = async (ctx, next) => {
  const defaultLimit = 25;

  ctx.query.limit = parseInt(ctx.query.limit, 10) || defaultLimit;
  if (ctx.query.limit > 100) {
    ctx.query.limit = defaultLimit;
  }

  await next();
};
