import express from "express";
import ffmpeg from "fluent-ffmpeg"; // Import fluent-ffmpeg for video processing

const app = express();

app.post("/process-video", (req, res) => {
    // Expect path fo the input video file in the request body
    const inputFilePath = req.body.inputFilePath;
    // Receive video file and convert into 360p before outputting
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send(`Bad Request: Missing ${inputFilePath ? "Input File path" : " "} ${outputFilePath ? (inputFilePath ? "and Output File path" : "Output File path")  : " "}`);
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=-1:360") // Scale the video to 360p
        .on("end", () => {
            res.status(200).send("Processing finished successfully")
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`)
            res.status(500).send(`Internal Server Error: ${err.message}`)
        })
        .save(outputFilePath)
});

const port = process.env.PORT || 3000; 

app.listen(port, () => {
    console.log(`Video processing service is listening at http://localhost:${port}`)
})