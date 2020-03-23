# Discord Scribe
> Bot for recording discord text sessions

Discord doesn't have a very nice way to delete logs. And copy-pasting the chat
by hand is time consuming and error-prone, especially for large chats where it
only loads in a few messages at a time.

Discord Scribe is a bot that you can add to your discord channel to record
logs. You can tell it when to start and stop recording chat logs, and it will
output the logs in a machine-readable format.

## How to use

The commands `scribe start` and `scribe stop` turn recording on/off for a given channel.

```
User: scribe start
Scribe: @User: Started recording
User: some stuff
User2: some other stuff
User3: some stuff
User: scribe stop
Scribe: @User: Stopped recording

ABCDEFG-2020-2-1-1-54-15-92a0a800.jsonl (Download)

```

## How to run

```
yarn build
TOKEN='XXXXXXXXXX' yarn start
```
