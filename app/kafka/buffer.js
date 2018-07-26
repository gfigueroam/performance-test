import schemas from './schemas';

import logger from '../monitoring/logger';


// Utility functions to deserialize incoming Kafka message buffers
function safeDeserialize(buffer) {
  try {
    // First try to deserialize the message buffer exactly as received
    //  Should succeed when serializer wrote only the bytes of data object
    return schemas.cb.fromBuffer(buffer);
  } catch (error) {
    return undefined;
  }
}

function deserialize(buffer) {
  // Try to deserialize message buffer exactly as received
  const result = safeDeserialize(buffer);
  if (result !== undefined) {
    return result;
  }

  if (buffer[0] === 0x00) {
    // Confluence library have a wire format with a 0x00 as magic first byte
    //  followed by a four byte sequence of the registered schema identifier
    // Strip out the first five bytes from buffer and try to deserialize message
    logger.warn('Kafka consumer: Deserializing without Confluence prefix...');
    return safeDeserialize(buffer.slice(5));
  }

  return undefined;
}

export default {
  deserialize,
};
