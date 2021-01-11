const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: string,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin']
    }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)