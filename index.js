const Discord = require('discord.js')
const auth = require('./auth.json')

const bot = new Discord.Client()

bot.on('message', msg => {
    if(msg.author.id == bot.user.id) {
        return
    }
	console.log(msg.channel.name)
	console.log(msg.content)
    msg.channel.send(msg.content)
})

bot.on('ready', () => {
	console.log('Connected')
})

bot.login(auth.token)
