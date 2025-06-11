// server/src/models/Permission.js
const { Schema, model } = require('mongoose');

const permissionSchema = new Schema({
  action: { // Örn: 'fidan:create', 'user:delete'
    type: String,
    required: true,
    unique: true,
  },
  description: { // Bu iznin ne işe yaradığını açıklayan metin
    type: String,
    required: true,
  }
});

const Permission = model('Permission', permissionSchema);
module.exports = Permission;