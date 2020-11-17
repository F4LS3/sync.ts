import express from 'express';
import * as fs from 'fs';

const app = express();
const port = process.env.PORT || 80;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send({ status: 200, message: 'Hello World!' });
    fs.appendFile(`${__dirname}/connections.txt`, `Connection: ${req.connection.remoteAddress}`, err => console.error(err));

    fs.readFile(`${__dirname}/connections.txt`, (err, data) => {
        console.log(data.toString());
    });
});

app.listen(port, () => {
    console.log(`Started WebServer on port ${port}`);
});
