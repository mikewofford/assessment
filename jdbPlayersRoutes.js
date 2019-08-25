const express = require('express')
const router = new express.Router()
const Player = require('./jdbUsersPlayers')
const auth = require('./auth')


router.get('/api/players', auth, async (req, res) => {
    try {
        const players = await Player.find({ owner: req.user._id })
        res.status(201).send(players)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/api/players/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update'})
    }

    try {
        const player = await Player.findOne({_id: req.params.id, owner: req.user._id})
        if (!player) {
            return res.status(404).send()
        }        
        updates.forEach((update) => {
            player[update] = req.body[update]
        })

        await player.save()
        res.send(player)
    } catch (e) {
        res.status(400).send(e)
    }

})


router.get('/api/players/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const player = await Player.findOne({ _id, owner: req.user._id })
        if (!player) {
            return res.status(404).send()
        }
        res.send(player)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/api/players', auth, async (req, res) => {
    const player = new Player({
        ...req.body,
        owner: req.user._id
    })
    
    try {
        await player.save()
        res.status(201).send(player)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/api/players/:id', auth, async (req, res) => {
    try {
        const player = await Player.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!player) {
            return res.status(404).send()
        }
        res.status(201).send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
