const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({ 
    first_name: {
        type: String,
        required: true,
        trim: true,
    }, 
    last_name: {
        type: String,
        required: true,
        trim: true,
    }, 
    rating: {
        type: Number,
        required: true,
        trim: true,
    },
    handedness: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        enum: ['left', 'right']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        //require: true,
        ref: 'User'
    }
})

playerSchema.index({first_name: 1, last_name: 1}, {unique: true})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
