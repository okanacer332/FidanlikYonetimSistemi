const mongoose = require('mongoose');

const kullaniciSchema = new mongoose.Schema({
    kullaniciAdi: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    sifre: {
        type: String,
        required: true
    },
    roller: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Kullanici', kullaniciSchema);