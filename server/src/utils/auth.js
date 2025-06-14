const jwt = require('jsonwebtoken');
const Kullanici = require('../models/Kullanici');

async function getUserFromReq(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'varsayilan_gizli_anahtar');
    const user = await Kullanici.findById(decoded.id).populate('roller');
    return user;
  } catch (err) {
    return null;
  }
}

module.exports = { getUserFromReq };
