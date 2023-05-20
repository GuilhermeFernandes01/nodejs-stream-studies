// node -e "process.stdout.write('hello-world'.repeat(1e7))" >> bigfile.txt; done
import { createReadStream } from 'node:fs'
import { createServer, get } from 'node:http'
import { dirname } from 'node:path'
import { PassThrough } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { CallTracker } from 'node:assert'
import { deepStrictEqual } from 'node:assert'

const dirName = dirname(fileURLToPath(import.meta.url))
const filePath = `${dirName}/files/bigfile.txt`;

const fileStream1 = createReadStream(filePath)
const fileStream2 = createReadStream(filePath)

createServer((request, response) => {
  console.info('connection received from API 01');

  fileStream1.pipe(response)
}).listen(3000, () => console.info('running at 3000'))

createServer(async (request, response) => {
  console.info('connection received from API 02');

  // [ERR_STREAM_PREMATURE_CLOSE] if you don't consume the whole stream

  await pipeline(fileStream2, response)
}).listen(3001, () => console.info('running at 3001'))

// ------ //
await setTimeout(500)

const getHttpStream = url => new Promise(resolve => {
  get(url, response => resolve(response))
})

const pass = () => new PassThrough()
const streamPipe = await getHttpStream('http://localhost:3000')
streamPipe.pipe(pass())

const streamPipeline = await getHttpStream('http://localhost:3001')
streamPipeline.pipe(pass())

streamPipe.destroy()
streamPipeline.destroy()

const tracker = new CallTracker()
const fn = tracker.calls(message => {
  console.info('stream.pipeline rejects if you don\'t consume it');
  deepStrictEqual(message.message, 'Premature close')
  process.exit()
})

process.on('uncaughtException', fn)

await setTimeout(10)

tracker.verify()
