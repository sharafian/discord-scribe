export class Config {
  public token = process.env.TOKEN
  public onPhrase = process.env.ON_PHRASE || 'start'
  public offPhrase = process.env.OFF_PHRASE || 'stop'
  public commandPrefix = process.env.COMMAND_PREFIX || 'scribe'
  public dbPath = process.env.DB_PATH || './data'
}
