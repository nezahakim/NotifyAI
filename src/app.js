const express = require('express')
const dotenv = require('dotenv').config()
const bot = require('./bot/bot')
const webhook = require('../api/webhook')

const app = express()
app.use(express.json())

app.get('/', async(req, res) =>{
    res.json('Hello, There!')
})

app.get('/api/webhook', (req,res)=>{
    return webhook(req, res)
})

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log("running on http://localhost:" + PORT)
})

bot.launch().then(() => console.log("Bot is runnings!"));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

