const express = require('express')
const router = new express.Router()
const Player = require('../models/player')
const auth = require('../middleware/authentication')


router.post('/api/players', auth, async (req, res) => {
    const player = new Player({
        ...req.body,
        owner: req.user._id
    })
    
    try {
        await player.save()
        let success
        if (!player) {
            success = false
            return res.status(409).send('Cannot create player')
        } else {
            success = true
        }
        const response = {player, success}
        res.status(201).send(response)
    } catch (e) {
        if (!req.body.first_name || !req.body.last_name || !req.body.rating || !req.body.handedness) {
            return res.status(409).send('Enter complete profile')
        }
        res.status(409).send(e.message)
    }
})

router.get('/api/players', auth, async (req, res) => {
    try {
        await req.user.populate('players').execPopulate()
        let success;
        if (!req.user.players) {
            success = false
            return res.status(409).send('No players found')
        } else {
            success = true
        }
        const response = {success, players: req.user.players}
        res.send(response)
    } catch (e) {
        res.status(500).send(e.message)
    }
})


router.get('/api/players/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const player = await Player.findOne({ _id: _id, owner: req.user._id })
        if (!player) {
            return res.status(404).send('Still not a player')
        }
        res.send(player)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.put('/api/players/:id', auth, async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
        if (!player) {
            return res.status(404).send({error: 'Player not recognized'})
        }
        await player.save()
        let success
        if (!player) {
            success = false
            return res.status(409).send('Unable to amend player')
        } else {
            success = true
        }
        const response = {player, success}
        res.send(response)
    }catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/api/players/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['first_name', 'last_name', 'rating', 'handedness']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update'})
    }

    try {
        const player = await Player.findOne({_id: req.params.id, owner: req.user._id})
        if (!player) {
            return res.status(404).send({ error: 'Not a player'})
        }        
        updates.forEach((update) => {
            player[update] = req.body[update]
        })

        await player.save()
        res.send(player)
    } catch (e) {
        res.status(400).send(e.message)
    }

})

router.delete('/api/players/:id', auth, async (req, res) => {
    try {
        const player = await Player.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        let success;
        if (!player) {
            success = false;
            return res.status(404).send({error: 'Cannot delete player'})
        } else {
            success = true;
        }
        const response = {player, success}
        res.send(response);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

module.exports = router
