const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    rolAdi: {
        type: String,
        required: true,
        unique: true
    },
    izinler: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }]
});

module.exports = mongoose.model('Role', roleSchema);