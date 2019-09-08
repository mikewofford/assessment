const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/authentication')

router.post('/api/user', async (req, res) => {
    const user = new User(req.body)

    try {
        if (req.body.confirm_password !== req.body.password) {
            return res.status(409).send({error: 'Passwords do not match'})
        }
        user.id = user._id.toString()
        await user.save()
        
        const token = await user.generateAuthToken()
        user.password = 'Hidden'
        user.confirm_password = 'Hidden'
        let success
        if (!user) {
            success = false
            return res.status(404).send({error: 'User not created'})
        } else {
            success = true
        }
        const response = { user, token, success}
        res.status(201).send(response)
    } catch (e) {
        if (!req.body.first_name || !req.body.last_name || !req.body.email) {
            return res.status(409).send({ error: 'Need first, last, email'})
        }

        res.status(409).send(e.message)
    }
    })

router.post('/api/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        user.password = 'Hidden'
        user.confirm_password = 'Hidden'
        let success
        if (!user) {
            success = false
            return res.status(404).send({error: 'Cannot login'})
        } else {
            success = true
        }
        const response = { user, token, success }
        res.send(response)
    } catch (e) {
        res.status(401).send(e.message)
    }
})

router.post('/api/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logged out')
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.post('/api/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e){
        res.status(500).send(e.message)
    }
})

router.get('/api/user', auth, async (req, res) => {
        res.send(req.user)
    })

router.put('/api/user/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!user) {
            return res.status(404).send({ error: 'Cannot update' })
        }
        await user.save()
        let success
        if (!user) {
            success = false
            return res.status(404).send({ error: 'Cannot login' })
        } else {
            success = true
        }
        const response = { user, success}
        res.send(response)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

// router.put('/api/user/:id', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['first_name', 'last_name', 'email', 'password']
//     const isValidOperation = updates.every((update) => {
//         return allowedUpdates.includes(update)
//     })
//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid update'})
//     }

//     try {
//         updates.forEach((update) => {
//             req.user[update] = req.body[update]})
//         const updatedUser = await req.user.save()
//         let success
//         if (!updatedUser) {
//             success = false
//             return res.status(404).send({ error: 'Cannot update'})
//         } else {
//             success = true
//         }
//         const response = { user: updatedUser, success }
//         res.send(response)
//     } catch (e) {
//         res.status(400).send(e.message)
//     }
// })


router.delete('/api/user', auth, async (req, res) => {
    try {
        const deletedUser = await req.user.remove()
        let success
        if (!deleteUser) {
            success = false
            return res.status(404).send({error: 'Cannot delete'})
        } else {
            success = true
        }
        const response = { user: deletedUser, success, message: 'Deleted' }
        res.send(response)
    } catch (e) {
        res.status(500).send('Cannot delete')
    }
})

module.exports = router
