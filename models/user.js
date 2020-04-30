const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    id: {
        type: id,
        unique:true,
        default: Date.now().toString()
    },
    name: {
        type: String,
        required:true
    },
    email: {
        type: email,
        required:true,
        unique:true
    },
    password: {
        type: password,
        required:true,
    }
})

module.exports = mongoose.model('User', authorSchema)