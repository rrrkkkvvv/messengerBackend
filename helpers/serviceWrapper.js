const serviceWrapper = (controller) => {
  return async (...args) => {
    try {
      const result = await controller(...args);
      return result;
    } catch (error) {
      console.error(error);
    }
  };
};
module.exports = serviceWrapper;
