import { randomUUID } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { dirname } from 'node:path';
import { Duplex, PassThrough, Writable } from 'node:stream'
import { fileURLToPath } from 'node:url';

const dirName = dirname(fileURLToPath(import.meta.url))

const consumers = [randomUUID(), randomUUID()].map(id => new Writable({
  write(chunk, encoding, callback) {
    console.info(`[${id}] bytes: ${chunk.length}, received a message at: ${new Date().toISOString()}`)
    callback(null, chunk)
  }
}))

const onData = chunk => {
  consumers.forEach((consumer, index) => {
    // check if the consumer is still active
    if (consumer.writableEnded) {
      delete consumers[index]
      return
    }

    consumer.write(chunk)
  })
}

const broadCaster = new PassThrough()
broadCaster.on('data', onData)

const stream = new Duplex.from({
  readable: createReadStream(`${dirName}/files/bigfile.txt`),
  writable: createWriteStream(`${dirName}/files/output.txt`)
})

stream
  .pipe(broadCaster)
  .pipe(stream)
