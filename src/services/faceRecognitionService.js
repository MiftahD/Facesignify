const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const loadModel = async (bucketName, modelFilename) => {
  const modelUrl = `gs://${bucketName}/${modelFilename}`;
  const model = await tf.loadGraphModel(modelUrl);
  return model;
};

const loadModels = async () => {
  const faceDetectionModel = await loadModel(process.env.FACE_DETECTION_MODEL_BUCKET, process.env.FACE_DETECTION_MODEL_FILENAME);
  const facenetModel = await loadModel(process.env.FACENET_MODEL_BUCKET, process.env.FACENET_MODEL_FILENAME);
  return { faceDetectionModel, facenetModel };
};

const predict = async (file) => {
  const { faceDetectionModel, facenetModel } = await loadModels();
  
  // Preprocess the image
  const imageBuffer = file._data;
  const imageTensor = tf.node.decodeImage(imageBuffer, 3).expandDims(0);
  
  // Perform face detection
  const detections = await faceDetectionModel.executeAsync(imageTensor);
  const detectionScores = detections[0].arraySync(); // Assuming the first output is detection scores
  const detectionBoxes = detections[1].arraySync(); // Assuming the second output is detection boxes
  
  // Extract face embeddings using facenet for each detected face
  const faceEmbeddings = [];
  for (let i = 0; i < detectionScores.length; i++) {
    if (detectionScores[i] > 0.5) { // Assuming 0.5 as threshold for detection
      const [yMin, xMin, yMax, xMax] = detectionBoxes[i];
      const faceTensor = tf.image.cropAndResize(imageTensor, [[yMin, xMin, yMax, xMax]], [0], [160, 160]); // Resize to FaceNet input size
      const faceEmbedding = await facenetModel.predict(faceTensor).data();
      faceEmbeddings.push(faceEmbedding);
    }
  }
  
  return { detections: detectionBoxes, faceEmbeddings };
};

module.exports = { predict };
