// for i in `seq 1 20`; do node -e "process.stdout.write('hello-world'.repeat(1e7))" >> bigfile.txt; done
import { createReadStream, statSync, promises } from 'node:fs'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirName = dirname(fileURLToPath(import.meta.url))

try {
  const filePath = `${dirName}/files/bigfile.txt`;
  const file = await promises.readFile(filePath)

  console.info('fileBuffer', file)
} catch (error) {
  console.info('Error: max 2GB reached...', error.message)
}

const fileName = `${dirName}/files/bigfile.txt`;
const { size } = statSync(fileName)
console.info('file size', size / 1e9, 'GB', '\n')

let chunkConsumed = 0
const stream = createReadStream(fileName)
// 65K per readable
// triggered by the first stream.read
  .once('data', message => {
    console.info('on data length', message.toString().length)
  })
  // this stream.read(11) will trigger the on('data') event
  .once('readable', _ => {
    console.info('read 11 chunk bytes', stream.read(11).toString())
    console.info('read 05 chunk bytes', stream.read(5).toString())

    chunkConsumed += 11 + 5
  })
  .on('readable', _ => {
    let chunk;
    // stream.read reads max 65kb
    while (null !== (chunk = stream.read())) {
      chunkConsumed += chunk.length
    }
  })
  .on('end', () => {
    console.info(`Read ${chunkConsumed / 1e9} bytes of data...`)
  })
