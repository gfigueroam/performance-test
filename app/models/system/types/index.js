export default {
  text: {
    validate: data => Object.prototype.toString.call(data) === '[object String]',
  },
};
