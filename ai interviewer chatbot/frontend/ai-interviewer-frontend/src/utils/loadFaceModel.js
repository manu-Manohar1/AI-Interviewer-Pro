import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";

let detector = null;
let detectorPromise = null;

/**
 * Loads and initializes the TensorFlow FaceMesh model.
 * Employs singleton promise pattern to prevent race conditions across components.
 */
export async function loadFaceModel() {
  if (detector) {
    return detector;
  }

  if (detectorPromise) {
    return detectorPromise;
  }

  detectorPromise = (async () => {
    try {
      // Initialize WebGL backend with CPU fallback safety
      try {
        await tf.setBackend("webgl");
      } catch (backendError) {
        console.warn("WebGL initialization failed, falling back to CPU backend:", backendError);
        await tf.setBackend("cpu");
      }

      await tf.ready();

      // Initialize MediaPipe FaceMesh detector
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: "tfjs",
        maxFaces: 1,
        refineLandmarks: true,
      };

      detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      return detector;
    } catch (error) {
      console.error("Failed to load TensorFlow FaceMesh model:", error);
      detectorPromise = null; // Reset promise so re-attempts are possible
      throw error;
    }
  })();

  return detectorPromise;
}