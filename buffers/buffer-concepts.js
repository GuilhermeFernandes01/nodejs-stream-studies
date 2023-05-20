const buffer = Buffer.alloc(5);

buffer.fill('hi', 0, 2)
buffer.fill(0x3a, 2, 3) // hexadecimal char code for :
buffer.fill(0X29, 4, 5) // hexadecimal char code for )

// [ERR_OUT_OF_RANGE]: when it reaches max value, it shouldbe  moved to another buffer
// buffer.fill(0X29, 5, 6)

const anotherBuffer = Buffer.alloc(6);
anotherBuffer.set(buffer, buffer.bufferOffset)
anotherBuffer.fill('four', 5, 6)

console.info({ buffer })
console.info(buffer.toString(), buffer, buffer.byteLength)

console.info('\n', { anotherBuffer })
console.info(anotherBuffer.toString(), anotherBuffer, anotherBuffer.byteLength)

// fill full data
const message = 'Hey there!'
const preAllocated = Buffer.alloc(message.length, message)
console.info('\n', { preAllocated })
console.info(preAllocated.toString(), preAllocated, preAllocated.byteLength)

// same thing of Buffer.from(string)
const withBufferFrom = Buffer.from(preAllocated);
console.info('\n', { withBufferFrom })
console.info(withBufferFrom.toString(), withBufferFrom, withBufferFrom.byteLength)

// Hexadecimals
const string = 'Hello world!'

const charCodes = []
const bytes = []

for (const index in string) {
  const code = string.charCodeAt(index)
  const byteCode = '0x' + Math.abs(code).toString(16)
  charCodes.push(code)
  bytes.push(byteCode)
}

console.info('\n', {
  charCodes,
  bytes,
  contentFromCharCodes: Buffer.from(charCodes).toString(),
  contentFromHexadecimalBytes: Buffer.from(bytes).toString(),
})
