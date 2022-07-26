"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const group_manager_1 = require("./group_manager");
const mongo_1 = require("./mongo");
const fs_1 = require("fs");
const app = (0, express_1.default)();
const port = process.env.PORT || 80;
app.use(express_1.default.json());
app.use(express_1.default.static(`${__dirname}/public/`));
app.use((0, express_fileupload_1.default)());
app.use(async (req, res, next) => {
    const ip = req.connection.remoteAddress.replace('::ffff:', '');
    const device = await mongo_1.deviceModel.findOne({ ip: ip });
    if (!device)
        return res.status(400).send({ status: 400, message: 'not a registered device' });
    req.device = device;
    next();
});
app.disable('x-powered-by');
app.get('/', (req, res) => {
    res.status(200).sendFile(`${__dirname}/index.html`);
});
app.post('/settings/upload', async (req, res) => {
    const video = req.files.video;
    const duration = req.body.duration;
    if (!video)
        return res.status(400).send({ status: 400, message: 'no files found' });
    if (!duration)
        return res.status(400).send({ status: 400, message: 'video duration not specified' });
    const group = {
        groupID: await (0, group_manager_1.getNextGroupID)(),
        groupName: video.name.replace('.mp4', ''),
        video: video.name,
        duration: duration,
        videoBuffer: Math.round(duration / 10000),
        currentVideoBuffer: 0,
        devices: [{
                deviceID: 0,
                ip: "127.0.0.1"
            }]
    };
    (0, group_manager_1.createGroup)(group, video, res);
});
app.get('/settings', (req, res) => {
    res.status(200).sendFile(`${__dirname}/settings/index.html`);
});
app.get('/createReadStream', async (req, res) => {
    const group = await mongo_1.groupModel.findOne({ "devices.deviceID": req.device.deviceID });
    if (!group)
        return res.status(400).send({ status: 400, message: "group isn't assigned to any group" });
    if (!req.headers.range)
        return res.status(400).send({ status: 400, message: 'no range header found' });
    const videoPath = `${__dirname}/videos/${group.groupName}/${group.groupName}_${group.currentVideoBuffer}.mp4`;
    const chunkSize = 10 ** 6;
    const size = (0, fs_1.statSync)(videoPath).size;
    const start = Number(req.headers.range.replace(/\D/g, ''));
    const end = Math.min(start + chunkSize, size - 1);
    const contentLength = end - start + 1;
    const readStream = (0, fs_1.createReadStream)(videoPath, { start, end });
    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": 'video/mp4'
    });
    readStream.pipe(res);
});
app.listen(port, () => {
    console.log(`Started WebServer on port ${port}`);
});
setInterval(async () => {
    const all = await mongo_1.groupModel.find({});
    all.forEach(async (group) => {
        await mongo_1.groupModel.updateOne({ groupID: group.groupID }, { currentVideoBuffer: group.currentVideoBuffer == group.videoBuffer - 1 ? 0 : group.currentVideoBuffer + 1 });
        console.log("Updated");
    });
}, 10000);
(0, mongo_1.connect)();
