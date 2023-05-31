// модель коллекции пользователей
//
const mongoose = require('mongoose');
const connection = require('../libs/connection');
const Role = require('./Role');

const Schema = new mongoose.Schema({
  roles: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: Role,
  },
  email: {
    type: String,
    required: 'не заполнено обязательное поле {PATH}',
    unique: 'Не уникальное значение {PATH}',
  },
  name: String,
  photo: String,
  fullName: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

/**
 * создание и обновление поля fullName пользователя
 */
Schema.pre('save', setFullName);
Schema.pre('findOneAndUpdate', updateFullName);

function setFullName() {
  this.fullName = getFullName.call(this);
}

function getFullName() {
  if (this.email && this.name) {
    return `${this.name || ''} ${this.email}`;
  }
  return undefined;
}

function updateFullName() {
  const email = this.getFilter()?.email;
  const name = this.getUpdate()?.name;

  this.setUpdate({
    fullName: getFullName.call({ email, name }),
    ...this.getUpdate(),
  });
}

module.exports = connection.model('User', Schema);
