// Polyfill for Node.js v22+ where buffer.SlowBuffer is deprecated/removed
// Required for older dependencies like buffer-equal-constant-time (used by jsonwebtoken -> jws -> jwa)
import buffer from 'node:buffer';

if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = function SlowBuffer() {};
  buffer.SlowBuffer.prototype = buffer.Buffer.prototype;
}
