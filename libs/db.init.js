const connection = require('./connection');
const logger = require('./logger');
const config = require('../config');

(async () => {
  // dropped database
  if (process.argv[2] === '--drop') {
    await connection.dropDatabase()
      .then(() => logger.info(`database "${config.mongodb.database}" dropped`))
      .catch((error) => logger.warn(error.message))
      .finally(() => process.exit());
  }

  logger.info(`database "${config.mongodb.database}" create`);
  process.exit();
})();
