const Discord = require("discord.js")
const auth = require("./auth.json")

var bot = new Discord.Client()

bot.on("message", msg => {
    console.log(msg.channel.name)
    console.log(msg.content)
})

bot.on("ready",() => {
    console.log("Connected")
})
bot.login(auth.token)

console.log('init')
