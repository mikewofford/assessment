const mongoose = require('mongoose')

//const handed = Object.freeze({left: Symbol("left"), right: Symbol("right")})
//const handed = new Enumerator("left", "right")

const Player = mongoose.model('Player', {
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
        type: String,
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
        require: true,
        ref: 'User'
    }
})

module.exports = Player
