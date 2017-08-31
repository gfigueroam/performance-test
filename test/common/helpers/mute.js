import mute from 'mute';

// Synchronous wrapper for running tests without console output
function muteTest(testFunction, done) {
  // Use mute library to suspend console output
  const unmute = mute();

  // Execute the test function synchronously
  testFunction();

  // Use mute library to resume console output
  unmute();

  // Use continuation function to continue tests
  done();
}

function muteTestAsync(testFunction) {
  // Use mute library to suspend console output
  const unmute = mute();

  // Execute the test function asynchronously
  return testFunction().then((result) => {
    // On success, resume console output and return
    unmute();
    return result;
  }).catch((error) => {
    // On failure, resume console output and throw
    unmute();
    throw error;
  });
}

export default {
  muteTest,
  muteTestAsync,
};
