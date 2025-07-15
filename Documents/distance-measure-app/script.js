let video = document.getElementById("video");
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

const KNOWN_WIDTH_CM = 5;       // Real width of your object
const KNOWN_DISTANCE_CM = 30;   // How far you placed it from camera

let focalLength = null;

// Setup camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
  });

// Wait for video to load and draw to canvas
video.addEventListener("loadeddata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  requestAnimationFrame(drawFrame);
});

function drawFrame() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  requestAnimationFrame(drawFrame);
}

// Mouse event to select object width manually
let startX = 0, endX = 0;

video.addEventListener("click", (e) => {
  // Get bounding box pixel width from click distance
  if (!startX) {
    startX = e.offsetX;
    alert("Click the other side of the object to finish measuring.");
  } else {
    endX = e.offsetX;
    let pixelWidth = Math.abs(endX - startX);

    if (!focalLength) {
      focalLength = (pixelWidth * KNOWN_DISTANCE_CM) / KNOWN_WIDTH_CM;
      alert(`Focal Length calculated: ${focalLength.toFixed(2)}px`);
    } else {
      let distance = (KNOWN_WIDTH_CM * focalLength) / pixelWidth;
      alert(`Estimated Distance: ${distance.toFixed(2)} cm`);
    }

    // Reset for next measurement
    startX = 0;
    endX = 0;
  }
});


