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
import {VideoIntelligenceServiceClient, protos} from "@google-cloud/video-intelligence";
import { Storage } from "@google-cloud/storage";


setupDirectories();

const app = express();
app.use(express.json());
const storage = new Storage();

// This endpoint will not be invoked by user, this will be invoked by the Cloud Pub/Sub message which is like a message queue
// Whenever a file is uploaded to raw video bucket, this endpoint will be notified by the cloud pub/sub message queue.

const videoAI = new VideoIntelligenceServiceClient();

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

  const inputFileName = data.name; 
  const accountType = data.name.split("-")[1];
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split(".")[0];

  if (!(await isVideoNew(videoId))) {
    res.status(400).send("Bad Request: video already processing or processed");
    return;
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0],
      videoType: accountType,
      status: "processing",
      createdAt: new Date().toISOString(),
    });
  }

  try {
    await downloadRawVideo(inputFileName, accountType);
  } catch (err: any) {
    console.error(`❌ Failed to download ${inputFileName}:`, err.message);
    res.status(404).send(`Video file not found: ${inputFileName}`);
    return;
  }

  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);
    console.error(err);
    res.status(500).send(`Internal Server Error: video processing failed.`);
    return;
  }

  await uploadProcessedVideo(outputFileName, accountType);

  const processedBucket =
  accountType === "applicant"
    ? "elevatr-applicant-processed-videos"
    : "elevatr-startup-processed-videos";  

  const gcsUri = `gs://${processedBucket}/${outputFileName}`;

  // Start explicit-content analysis (long-running op)
  const [operation] = await videoAI.annotateVideo({
    inputUri: gcsUri,
    features: [protos.google.cloud.videointelligence.v1.Feature.EXPLICIT_CONTENT_DETECTION], 
  });

  const [response] = await operation.promise();

  const frames =
    response.annotationResults?.[0]?.explicitAnnotation?.frames || [];

  const unsafe = frames.some((f) =>
    ["LIKELY", "VERY_LIKELY"].includes(f.pornographyLikelihood as string)
  );

  await setVideo(videoId, {
    status: "processed",
    filename: outputFileName,
    moderation: unsafe ? "rejected" : "clean",
    checkedAt: new Date().toISOString(),
  });

  if (unsafe) {
    await storage
      .bucket(processedBucket)
      .file(outputFileName)
      .move(`rejected/${outputFileName}`);
  }
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  res.status(200).send(`Video processing completed successfully.`);
  return;
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `Video processing service is listening at http://localhost:${port}`
  );
});
