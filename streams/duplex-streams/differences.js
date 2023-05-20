import { Duplex, Transform } from 'node:stream'

const duplexStream = new Duplex({
  objectMode: true,
  write(chunk, encoding, callback) {
    console.info('[writable] saving', chunk)

    callback()
  },
  read() {
    const everySecond = (intervalContext) => {
      this.counter = this.counter ?? 0
      this.counter += 1

      if (this.counter <= 5) {
        this.push(`My name is Guilherme ${this.counter}`)
        return;
      }

      clearInterval(intervalContext)
      this.push(null)
    }

    setInterval(function () { everySecond(this) })
  }
})

/*
  To prove they are different communication channels
  write triggers the writable stream from our duplex
 */
duplexStream.write('[duplex]: this is a writable\n')

// on data: our duplexStream.on('data') will be triggered everytime we call the push function
duplexStream.push('[duplex]: this is a readable')

const transformToUpperCase = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    callback(null, chunk.toUpperCase());
  }
})

transformToUpperCase.write('[transform] hello from writer')
// the push method will ignore what you have in the transform function
transformToUpperCase.push('[transform] hello from reader')

duplexStream
  .pipe(transformToUpperCase)
  // it will redirect all data to the duplex's writable channel
  .pipe(duplexStream)
