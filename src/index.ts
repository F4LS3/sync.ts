import express from 'express';
import { UploadedFile } from 'express-fileupload';
import fileUpload from 'express-fileupload';
import { createGroup, getGroup, getNextGroupID, readVideoStats } from './group_manager';
import { connect } from './mongo';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 80;

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));
app.use(fileUpload());

app.disable('x-powered-by');

app.get('/', (req, res) => {
    
});

app.post('/settings/upload', async (req, res) => {
    const video = req.files.video as UploadedFile;
    const duration = req.body.duration;

    if(!video) return res.status(400).send({ status: 400, message: 'no files found' });
    if(!duration) return res.status(400).send({ status: 400, message: 'video duration not specified' });

    createGroup({
        groupID: await getNextGroupID(),
        groupName: video.name.replace('.mp4', ''),
        master: undefined,
        video: video.name,
        duration: duration,
        videoTime: 0,
        devices: []
    })
        .catch(err => res.status(409).send({ status: 409, message: err }))
        .then(() => res.status(200).send({ status: 200, message: 'group successfully created' }));

    video.mv(`${__dirname}/videos/${video.name}`);
});

app.get('/settings', (req, res) => {
    res.status(200).sendFile(`${__dirname}/settings/index.html`);
});

app.listen(port, () => {
    console.log(`Started WebServer on port ${port}`);
});

connect();