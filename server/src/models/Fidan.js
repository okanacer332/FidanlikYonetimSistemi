// server/src/models/Fidan.js
const { Schema, model } = require('mongoose'); //

const fidanSchema = new Schema({ //
  name: { //
    type: String, //
    required: true, //
  },
  parentId: { //
    type: Schema.Types.ObjectId, //
    ref: 'Fidan', //
    default: null, //
  },
  musteriId: { // <-- EKLENEN KRİTİK ALAN //
    type: String, //
    required: true, //
  },
  // fidanKodu: { // Kaldırıldı
  //   type: String,
  //   unique: true,
  //   sparse: true,
  // },
  // satisFiyati: { // Kaldırıldı
  //   type: Number,
  // },
}, { timestamps: true }); //

const Fidan = model('Fidan', fidanSchema); //
module.exports = Fidan;