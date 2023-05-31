const mongoose = require('mongoose');
const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: 'не заполнено обязательное поле {PATH}',
  },
  message: {
    type: String,
  },
  files: [{ originalName: String, fileName: String }],
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

module.exports = connection.model('Note', Schema);
