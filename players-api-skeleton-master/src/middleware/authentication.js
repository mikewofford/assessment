const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        if (!req.header('Authorization')) {
            return res.status(403).send('No token found')
        }
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'secretToken')
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if (!user || !token) {
            throw new Error('User or token not found')
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({error: 'Please authenticate'})
    } 
}

module.exports = auth
