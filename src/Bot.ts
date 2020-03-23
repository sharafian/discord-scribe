import Discord from 'discord.js'
import { Injector } from 'reduct'

import { Config } from './Config'
import { MessageRecord, Recording } from './Recording'

export type Message = Discord.Message | Discord.PartialMessage

export class Bot {
  private config: Config
  private rec: Recording
  private bot = new Discord.Client()

  constructor (deps: Injector) {
    this.config = deps(Config)
    this.rec = deps(Recording)
  }

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

    return msg.content.startsWith(this.config.commandPrefix)
  }

  private async handleCommand (msg: Message): Promise<void> {
    if (!msg.channel || !msg.content || !msg.reply) {
      return
    }

    const channelId = msg.channel.id
    const recId = await this.rec.getRecId(channelId)

    if (msg.content.includes(this.config.onPhrase)) {
      if (!recId) {
        await this.rec.newRecId(channelId)
      }

      await msg.reply(`${recId ? 'Still' : 'Started'} recording.`)

    } else if (msg.content.includes(this.config.offPhrase)) {
      await this.rec.clearRecId(channelId)

      if (recId) {
        const output = Buffer.from(
          await this.rec.getRecording(recId) || '',
          'utf8'
        )

        await msg.reply('Stopped recording.',
          new Discord.MessageAttachment(output, `${recId}.jsonl`))
      } else {
        await msg.reply('Not recording.')
      }
    } else {
      await msg.reply('I don\'t know that command')
    }
  }

  async start (): Promise<void> {
    if (!this.config.token) {
      throw new Error('discord token must be specified (TOKEN)')
    }

    this.bot.on('message', async msg => {
      if (!msg.channel) return

      const channelId = msg.channel.id
      const serialized = this.serializeMessage(msg)
      const recId = await this.rec.getRecId(channelId)

      if (serialized && recId) {
        console.log(JSON.stringify(serialized))
        await this.rec.addRecordingRecord(recId, serialized)
      }

      if (this.messageIsCommand(msg)) {
        await this.handleCommand(msg)
      }
    })

    this.bot.on('ready', () => {
      console.log(`logged in as ${this.bot?.user?.tag}`)
    })

    await this.bot.login(this.config.token)
  }
}
