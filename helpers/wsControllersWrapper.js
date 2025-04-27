const wsControllersWrapper = (controller) => {
  const func = async (arguments) => {
    try {
      const result = await controller(arguments);
      return result;
    } catch (error) {
      console.error(error);
    }
  };
  return func;
};
module.exports = wsControllersWrapper;
