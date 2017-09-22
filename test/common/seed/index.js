const buildNumber = process.env.BUILD_NUMBER || Math.floor(Math.random() * 1000);

export default {
  buildNumber,
};
