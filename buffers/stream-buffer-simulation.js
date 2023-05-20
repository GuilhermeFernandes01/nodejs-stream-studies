// for i in `seq 1 100`; do node -e "process.stdout.write('$i-hello-world\n')" >> text.txt; done
import { readFile } from 'fs/promises'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirName = dirname(fileURLToPath(import.meta.url))

// if it's a big file, it would crash or make your program slow down
const data = (await readFile(`${dirName}/files/text.txt`)).toString().split('\n')
const LINES_PER_ITERACTION = 10
const iteractions = data.length / LINES_PER_ITERACTION // ten in ten lines (in this example: not bytes!)

let page = 0;

for (let index = 1; index < iteractions; index++) {
  const chunk = data.slice(page, page += LINES_PER_ITERACTION).join('\n')

  // image this as a maximum 2GB buffer Node.js can handle per time
  const buffer = Buffer.from(chunk)

  const amountOfBytes = buffer.byteOffset
  const bufferData = buffer.toString().split('\n')
  const amountOfLines = bufferData.length

  // bufferData will be splitted into small pieces and process them invididually on demand
  console.info('processing', bufferData, `lines: ${amountOfLines}, bytes: ${amountOfBytes}`)
}
