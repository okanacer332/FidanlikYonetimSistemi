// server/src/models/Fidan.js
const { Schema, model } = require('mongoose'); //

const fidanSchema = new Schema({
  ad: {
    type: String,
    required: true,
    trim: true,
  },
  aciklama: {
    type: String,
    default: '',
  },
  stokMiktari: {
    type: Number,
    required: true,
    min: 0,
  },
  alisFiyati: {
    type: Number,
    default: 0,
    min: 0,
  },
  satisFiyati: {
    type: Number,
    default: 0,
    min: 0,
  },
  kategori: {
    type: String,
    default: '',
  },
  tedarikci: {
    type: String,
    default: '',
  },
  lokasyon: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Fidan = model('Fidan', fidanSchema); //
module.exports = Fidan;