import { Bot } from './Bot'
import reduct from 'reduct'

const bot = reduct()(Bot)
bot
  .start()
  .catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
