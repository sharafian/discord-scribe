import { randomBytes } from 'crypto'
import { Injector } from 'reduct'
import { Save } from './Save'

export interface MessageRecord {
  time: number
  from: string
  content: string
}

export function generateRecId (id: string) {
  const time = new Date()
  const segments = [
    id,
    time.getUTCFullYear(),
    time.getUTCMonth(),
    time.getUTCDay(),
    time.getUTCHours(),
    time.getUTCMinutes(),
    time.getUTCSeconds(),
    randomBytes(4).toString('hex')
  ]

  return segments.join('-')
}

export class Recording {
  private save: Save

  constructor (deps: Injector) {
    this.save = deps(Save)
  }

  public async newRecId (channelId: string): Promise<void> {
    return this.save.set(`recording_id:${channelId}`, generateRecId(channelId))
  }

  public async clearRecId (channelId: string): Promise<void> {
    return this.save.del(`recording_id:${channelId}`)
  }

  public async getRecId (channelId: string): Promise<string | void> {
    return this.save.get(`recording_id:${channelId}`)
  }

  public async getRecording (id: string) {
    return this.save.get(`recording:${id}`)
  }

  public async clearRecording (id: string) {
    return this.save.del(`recording:${id}`)
  }

  public async addRecordingRecord (id: string, value: MessageRecord) {
    return this.save.append(`recording:${id}`, JSON.stringify(value) + '\n')
  }
}
