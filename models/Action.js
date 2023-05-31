const mongoose = require('mongoose');
const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    unique: 'Не уникальное значение {PATH}',
  },
}, {
  timestamps: true,
});

Schema.index(
  {
    title: 'text',
  },
  {
    name: 'ActionSearchIndex',
    default_language: 'russian',
  },
);

module.exports = connection.model('Action', Schema);
