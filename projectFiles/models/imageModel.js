const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    name: {type: String, required: true},

});

module.exports = mongoose.model('imageModel', imageSchema);