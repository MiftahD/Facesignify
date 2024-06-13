const faceRecognitionService = require('../services/faceRecognitionService');

const predict = async (request, h) => {
  const { file } = request.payload;
  if (!file) {
    throw new InputError('Missing required file');
  }
  const result = await faceRecognitionService.predict(file);
  return h.response({ status: 'success', result }).code(200);
};

module.exports = { predict };
