import Discord from 'discord.js'

export class Bot {
  private token = process.env.TOKEN
  private bot = new Discord.Client()


  async start () {
    if (!this.token) {
      throw new Error('TOKEN must be specified')
    }

    this.bot.on('message', msg => {
      if (msg.content === 'ping' && msg.reply) {
        msg.reply('pong')
      }
    })

    this.bot.on('ready', () => {
      console.log(`logged in as ${this.bot?.user?.tag}`)
    })

    this.bot.login(this.token)
  }
}
