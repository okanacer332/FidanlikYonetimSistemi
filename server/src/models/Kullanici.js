// server/src/models/Kullanici.js
const { Schema, model } = require('mongoose');

const kullaniciSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  sifre: { type: String, required: true },
  musteriId: { type: String, required: true },
  // ROL ALANI GÜNCELLENDİ
  role: { // Kullanıcının rolü
    type: Schema.Types.ObjectId,
    ref: 'Role', // Role modeline referans veriyoruz
    required: true,
  }
}, { timestamps: true });

const Kullanici = model('Kullanici', kullaniciSchema);
module.exports = Kullanici;