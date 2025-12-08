export const BufferExtensions = () => {
  if (Buffer.joinBuffers === undefined) {
    Buffer.prototype.joinBuffers = function (buffers: Array<Buffer>, delimiter = " ") {
      const d = Buffer.from(delimiter);
      return buffers.reduce((prev, b) => Buffer.concat([prev, d, b]));
    };
  }
};

