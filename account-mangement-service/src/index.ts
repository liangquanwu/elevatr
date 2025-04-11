import express from 'express';

const app = express();
app.use(express.json());

app.get('/get-user', (req, res) => {
    //
})

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

