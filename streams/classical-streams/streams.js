import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { dirname } from 'node:path';
import { Readable, Transform } from 'node:stream'
import { fileURLToPath } from 'node:url';

const dirName = dirname(fileURLToPath(import.meta.url))

// data source: file, database, website, anything you can consume on demand
const readable = new Readable({
  read() {
    for (let index = 0; index < 1e6; index++) {
      const person = {
        id: randomUUID(),
        name: `Guilherme-${index}`
      }

      const data = JSON.stringify(person)
      this.push(data)
    }

    // notify that the data is empty (consumed everything)
    this.push(null)
  }
})

// map/transform data
const mapFields = new Transform({
  transform(chunk, encoding, callback) {
    const data = JSON.parse(chunk)
    const result = `${data.id},${data.name.toUpperCase()}\n`

    callback(null, result)
  }
})

const mapHeaders = new Transform({
  transform(chunk, encoding, callback) {
    this.counter = this.counter ?? 0
    if (this.counter) {
      return callback(null, chunk)
    }
    this.counter += 1

    callback(null, 'id,name\n'.concat(chunk))
  }
})


// writable is always to output: print, save, send email, send to another stream...
const pipeline = readable
  .pipe(mapFields)
  .pipe(mapHeaders)
  .pipe(createWriteStream(`${dirName}/files/csv.csv`))

pipeline.on('end', () => console.info('Process finished!'))
