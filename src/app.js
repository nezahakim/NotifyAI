const express = require('express')
require('dotenv').config()
const bot = require('./bot/bot')

const app = express()
app.use(express.json())

app.get('/', async(req, res) =>{
    res.json('Hello, There!')
})


bot.launch().then(() => console.log("Bot is runnings!"));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log("running on http://localhost:" + PORT)
})