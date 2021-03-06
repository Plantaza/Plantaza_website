const mongoose = require('mongoose');
const { Rastline } = require('../controllers/rastline');
const { Uporabniki } = require('../controllers/uporabniki');

const oglasiShema = new mongoose.Schema({
  idRastline: { type: String, required: true },
  idUporabnika: { type: String, required: true},
  slika: { type: String, required: false }
})

mongoose.model('Oglasi', oglasiShema, 'Oglasi')