import express from 'express';
import { UploadedFile } from 'express-fileupload';
import fileUpload from 'express-fileupload';
import { createGroup, getNextGroupID } from './group_manager';
import { connect, deviceModel, groupModel } from './mongo';
import { Device, Group } from './types';
import { createReadStream, statSync } from 'fs'

declare global {
    namespace Express {
        export interface Request {
           device: Device
        }
    }
}

const app = express();
const port = process.env.PORT || 80;

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));
app.use(fileUpload());
app.use(async (req, res, next) => {
    if(req.path.startsWith('settings/')) return next();

    const ip = req.connection.remoteAddress.replace('::ffff:', '');
    console.log(ip);
    
    const device: Device = await deviceModel.findOne({ ip: ip });

    if(!device) return res.status(400).send({ status: 400, message: 'not a registered device' });
    req.device = device;

    next();
});

app.disable('x-powered-by');

app.get('/', (req, res) => {
    res.status(200).sendFile(`${__dirname}/index.html`);
});

app.post('/settings/upload', async (req, res) => {
    const video = req.files.video as UploadedFile;
    const duration = req.body.duration;

    if(!video) return res.status(400).send({ status: 400, message: 'no files found' });
    if(!duration) return res.status(400).send({ status: 400, message: 'video duration not specified' });

    const group: Group = {
        groupID: await getNextGroupID(),
        groupName: video.name.replace('.mp4', ''),
        video: video.name,
        duration: duration,
        videoBuffer: Math.round(duration / 10000),
        currentVideoBuffer: 0,
        devices: [{
            deviceID: 0,
            deviceName: 'localhost',
            ip: "127.0.0.1"
        },
        {
            deviceID: 1,
            deviceName: 'localhost',
            ip: "::1"
        }]
    };

    createGroup(group, video, res);
});

app.get('/settings', (req, res) => {
    res.status(200).sendFile(`${__dirname}/settings/index.html`);
});

app.get('/createReadStream', async (req, res) => {
    const group: Group = await groupModel.findOne({ "devices.deviceID": req.device.deviceID });

    if(!group) return res.status(400).send({ status: 400, message: "device isn't assigned to any group" });
    //if(!req.headers.range) return res.status(400).send({ status: 400, message: 'no range header found' });

    const videoPath = `${__dirname}/videos/${group.groupName}/${group.groupName}_${group.currentVideoBuffer}.mp4`;
    res.status(200).sendFile(videoPath);
    /*const chunkSize = 10 ** 6;
    const size = statSync(videoPath).size;
    
    const start = Number(req.headers.range.replace(/\D/g, ''));
    const end = Math.min(start  + chunkSize, size - 1);
    const contentLength = end - start + 1;

    const readStream = createReadStream(videoPath, { start, end });

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": 'video/mp4'
    });

    readStream.pipe(res);*/
});

app.post('/settings/devices/register', async (req, res) => {
    if(!req.body.deviceName) return res.status(400).send({ status: 400, message: 'no device name found' });
    if(!req.body.deviceIP) return res.status(400).send({ status: 400, message: 'no device ip found' });

    const device: Device = {
        deviceID: await deviceModel.countDocuments(),
        deviceName: req.body.deviceName,
        ip: req.body.deviceIP
    };

    new deviceModel(device).save((error, result) => {
        if(error) return res.status(400).send({ status: 400, message: 'device already registered' });
        res.status(200).send({ status: 200, message: result });
    });
});

app.post('/settings/devices/delete', async (req, res) => {
    if(!req.body.deviceID) return res.status(400).send({ status: 400, message: 'no device id found' });

    deviceModel.deleteOne({ deviceID: req.body.deviceID }).catch(err => {
        return res.status(500).send({ status: 500, message: err })
    }).then(() => res.status(200).send({ status: 200, message: 'device has been deleted' }));
});

app.listen(port, () => {
    console.log(`Started WebServer on port ${port}`);
});

setInterval(async () => {
    const all = await groupModel.find({});

    all.forEach(async (group: Group) => {
        await groupModel.updateOne({ groupID: group.groupID }, { currentVideoBuffer: group.currentVideoBuffer == group.videoBuffer - 1 ? 0 : group.currentVideoBuffer + 1 });
    });
}, 10000);

connect();