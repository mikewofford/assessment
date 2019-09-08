const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Player = require('./player')

const userSchema = new mongoose.Schema({  
id: {
    type: String
},  
first_name: {
    type: String,
    required: true,
    trim: true
},
last_name: {
    type: String,
    required: true,
    trim: true
},
email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error('Invalid email')
        }
    }
},
password: {
    type: String,
    required: true,
    trim: true, 
},
confirm_password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
        const isMatch = bcrypt.compare(this.password, value)
        if (!isMatch) {
            throw new Error('Passwords must match')
        }
    } 
},
tokens: [{
    token: {
        type: String,
        required: true
    }
}]
})

userSchema.virtual('players', {
    ref: 'Player',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'secretToken')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

userSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
        user.confirm_password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Deletes all user's tasks when user is deleted
userSchema.pre('remove', async function(next) {
    const user = this
    await Player.deleteMany({ owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

//User.createIndexes()

module.exports = User
