// server/src/models/Role.js
const { Schema, model } = require('mongoose');

const roleSchema = new Schema({
  name: { // Rolün adı, örn: "Depo Sorumlusu"
    type: String,
    required: true,
  },
  musteriId: { // Bu rolün hangi müşteriye ait olduğu
    type: String,
    required: true,
  },
  permissions: [{ // Bu rolün sahip olduğu izinlerin listesi
    type: Schema.Types.ObjectId,
    ref: 'Permission' // Permission modeline referans veriyoruz
  }]
});

// Bir müşteri içinde aynı isimde iki rol olmasını engelle
roleSchema.index({ name: 1, musteriId: 1 }, { unique: true });

const Role = model('Role', roleSchema);
module.exports = Role;