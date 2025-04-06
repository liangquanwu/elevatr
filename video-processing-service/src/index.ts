import express from "express";
import {
  setupDirectories,
  convertVideo,
  downloadRawVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  uploadProcessedVideo,
} from "./storage";
import { isVideoNew, setVideo } from "./firestore";


setupDirectories();

const app = express();
app.use(express.json());

// This endpoint will not be invoked by user, this will be invoked by the Cloud Pub/Sub message which is like a message queue
// Whenever a file is uploaded to raw video bucket, this endpoint will be notified by the cloud pub/sub message queue.

app.post("/process-video", async (req, res) => {
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received");
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("Invalid message payload received");
  }

  const inputFileName = data.name; // format of <UID>-<DATE>.<EXTENSION>
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split(".")[0];

  if (!isVideoNew(videoId)) {
    res.status(400).send("Bad Request: video already processing or processed");
  }
  else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0],
      status: "processing",
    })
  }

  // Download the raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  // Convert the video to 360p
  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    // We would delete this file as these files would be created and we would need to delete these files just in case (corrupted files)
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);
    console.error(err);
    res.status(500).send(`Internal Server Error: video processing failed.`);
  }

  // Upload the processed video to Cloud storage
  await uploadProcessedVideo(outputFileName);

  setVideo(videoId, {
    status: "processed",
    filename: outputFileName,
  })

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  res.status(200).send(`Video processing completed successfully.`);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `Video processing service is listening at http://localhost:${port}`
  );
});
