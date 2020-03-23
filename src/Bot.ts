import Discord from 'discord.js'

export type Message = Discord.Message | Discord.PartialMessage
export interface MessageRecord {
  time: number
  from: string
  content: string
}

export class Bot {
  private token = process.env.TOKEN
  private onPhrase = process.env.ON_PHRASE || 'start'
  private offPhrase = process.env.OFF_PHRASE || 'stop'
  private commandPrefix = process.env.COMMAND_PREFIX || 'scribe'

  private bot = new Discord.Client()
  private isRecording: Map<string, boolean> = new Map()
  private recordings: Map<string, MessageRecord[]> = new Map()

  // [4:51 PM] BOT Scribe: @sharafian, Still recording.
  private serializeMessage (msg: Message): MessageRecord | void {
    if (!msg.cleanContent || !msg.author || !msg.createdTimestamp) {
      return
    }

    return {
      time: msg.createdTimestamp,
      from: msg.member?.nickname || msg.author.tag,
      content: msg.cleanContent
    }
  }

  private messageIsCommand (msg: Message): boolean {
    if (!msg.content) {
      return false
    }

    return msg.content.startsWith(this.commandPrefix)
    /*if (!msg.mentions || msg.mentions.users.size !== 1) {
      return false
    }

    const id = this.bot?.user?.id
    if (!id) {
      return false
    }

    return !!(msg.mentions.users.get(id)
      || msg.mentions.roles.get(id))*/
  }

  private async handleCommand (msg: Message): Promise<void> {
    if (!msg.channel || !msg.content || !msg.reply) {
      return
    }

    const recState = this.isRecording.get(msg.channel.id)

    if (msg.content.includes(this.onPhrase)) {
      this.isRecording.set(msg.channel.id, true)
      await msg.reply(`${recState ? 'Still' : 'Started'} recording.`)
    } else if (msg.content.includes(this.offPhrase)) {
      this.isRecording.set(msg.channel.id, false)

      if (recState) {
        const output = Buffer.from(
          JSON.stringify(this.recordings.get(msg.channel.id) || []),
          'utf8'
        )

        await msg.reply('Stopped recording.',
          new Discord.MessageAttachment(output, 'output.json'))
      } else {
        await msg.reply('Not recording.')
      }
    } else {
      await msg.reply('I don\'t know that command')
    }
  }

  async start (): Promise<void> {
    if (!this.token) {
      throw new Error('TOKEN must be specified')
    }

    this.bot.on('message', async msg => {
      if (!msg.channel) return

      const channelId = msg.channel.id
      const serialized = this.serializeMessage(msg)
      const recState = this.isRecording.get(channelId)

      if (serialized && recState) {
        console.log(JSON.stringify(serialized))

        const recording = this.recordings.get(channelId) || []
        recording.push(serialized)
        this.recordings.set(channelId, recording)
      }

      if (this.messageIsCommand(msg)) {
        await this.handleCommand(msg)
      }
    })

    this.bot.on('ready', () => {
      console.log(`logged in as ${this.bot?.user?.tag}`)
    })

    await this.bot.login(this.token)
  }
}
