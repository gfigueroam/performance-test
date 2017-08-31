// Helper function to parse and validate command line parameters
export default function parseArgv(args, key, defaultValue) {
  const regexCheck = new RegExp(`^${key}=`, 'i');
  const result = {
    arg_passed: false,
    value: defaultValue,
  };

  args.forEach(argm => {
    if (regexCheck.test(argm)) {
      result.value = argm.substring(key.length + 1, argm.length);
      result.arg_passed = true;
    }
  });

  return result;
}
