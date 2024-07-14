const video = document.getElementById('video');

// Load face-api.js models from specified URIs
Promise.all([
    // Load the Tiny Face Detector model
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    // Load the Face Landmark model
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    // Load the Face Recognition model
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    // Load the Face Expression model
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo).catch(err => console.error("Failed to load models:", err));

// Function to start video streaming from the webcam
async function startVideo() {
    try {
        // Request access to the webcam video stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        // Set the video source to the obtained video stream
        video.srcObject = stream;
    } catch (err) {
        // Log an error if access to the webcam fails
        console.error("Error accessing the camera: ", err);
    }
}

// Event listener for when the video starts playing
video.addEventListener('play', () => {
    // Create a canvas element from the video element
    const canvas = faceapi.createCanvasFromMedia(video);
    // Append the canvas element to the document body
    document.body.append(canvas);

    // Get the display size of the video element
    const displaySize = { width: video.width, height: video.height };
    // Match the canvas size to the display size of the video
    faceapi.matchDimensions(canvas, displaySize);

    // Set an interval to perform face detection and drawing every 100ms
    setInterval(async () => {
        try {
            // Detect faces, landmarks, and expressions in the video frame
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            // Log the detections to the console
            console.log(detections);

            // Resize the detections to match the display size
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            // Get the canvas 2D drawing context
            const context = canvas.getContext('2d');
            // Clear the canvas for the next frame
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the detected faces on the canvas
            faceapi.draw.drawDetections(canvas, resizedDetections);
            // Draw the detected face landmarks on the canvas
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            // Draw the detected face expressions on the canvas
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        } catch (err) {
            // Log any errors that occur during the face detection process
            console.error("Error during face detection: ", err);
        }
    }, 100); // Interval set to 100 milliseconds
});



