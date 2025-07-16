 const video = document.getElementById("video");

    // Ask for camera access
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(error => {
        alert("Camera access denied or not available: " + error);
      });