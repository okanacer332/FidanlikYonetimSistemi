const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    izinAdi: {
        type: String,
        required: true,
        unique: true
    },
    aciklama: {
        type: String
    }
});

module.exports = mongoose.model('Permission', permissionSchema);