const express = require('express')
require('./mongoose')
const userRouter = require('./jdbUsersRoutes')
const playerRouter = require('./jdbPlayersRoutes')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(playerRouter)


app.listen(port, () => {
    console.log('Server is up on port ', port)
})


