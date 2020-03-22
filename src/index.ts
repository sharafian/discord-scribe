import { Bot } from './Bot'

const bot = new Bot()
bot
  .start()
  .catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
