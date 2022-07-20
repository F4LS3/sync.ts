"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const group_manager_1 = require("./group_manager");
const mongo_1 = require("./mongo");
const app = express_1.default();
const port = process.env.PORT || 80;
app.use(express_1.default.json());
app.use(express_1.default.static(`${__dirname}/public/`));
app.use(express_fileupload_1.default());
app.disable('x-powered-by');
app.get('/', (req, res) => {
});
app.post('/settings/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const video = req.files.video;
    const duration = req.body.duration;
    if (!video)
        return res.status(400).send({ status: 400, message: 'no files found' });
    if (!duration)
        return res.status(400).send({ status: 400, message: 'video duration not specified' });
    group_manager_1.createGroup({
        groupID: yield group_manager_1.getNextGroupID(),
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
}));
app.get('/settings', (req, res) => {
    res.status(200).sendFile(`${__dirname}/settings/index.html`);
});
app.listen(port, () => {
    console.log(`Started WebServer on port ${port}`);
});
mongo_1.connect();
