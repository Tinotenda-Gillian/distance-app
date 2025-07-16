let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let output = document.getElementById("output");

// Known object width and focal length (calibrated previously)
const KNOWN_WIDTH_CM = 5; // Example: perfume bottle
const FOCAL_LENGTH = 650; // Adjust this based on your calibration

// Access camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => alert("Camera access error: " + err));

function onOpenCvReady() {
  console.log("OpenCV.js is ready!");

  video.addEventListener("loadeddata", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    processVideo();
  });
}

function processVideo() {
  let cap = new cv.VideoCapture(video);
  let frame = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
  let gray = new cv.Mat();
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  const FPS = 10;
  function detect() {
    cap.read(frame);
    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, gray, 50, 150);
    cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (contours.size() > 0) {
      let maxContour = contours.get(0);
      for (let i = 1; i < contours.size(); ++i) {
        if (cv.contourArea(contours.get(i)) > cv.contourArea(maxContour)) {
          maxContour = contours.get(i);
        }
      }

      let rect = cv.boundingRect(maxContour);
      let pixelWidth = rect.width;

      let distance = (KNOWN_WIDTH_CM * FOCAL_LENGTH) / pixelWidth;

      // Draw rectangle & text
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText(`~${distance.toFixed(2)} cm`, rect.x, rect.y - 10);

      output.innerText = `Distance: ${distance.toFixed(2)} cm`;
    }

    setTimeout(detect, 1000 / FPS);
  }

  detect();
}
