import { Group } from "./types";
import * as fs from 'fs';
import { groupModel } from "./mongo";
import { Response } from "express";
import { UploadedFile } from "express-fileupload";
import ffmpeg from 'fluent-ffmpeg';

export const getNextGroupID = async () => {
    const id = await groupModel.countDocuments();
    return id;
}

export const createGroup = (group: Group, file: UploadedFile, response: Response) => {
    const doc = new groupModel(group);
    
    doc.save(async (error, result) => {
        if(error) return response.status(400).send({ status: 400, message: 'group already exists' });
        response.status(200).send({ status: 200, message: result  });
        
        fs.mkdir(`${__dirname}/videos/${group.groupName}/`, () => {});
        file.mv(`${__dirname}/videos/${group.groupName}/${file.name}`).catch(err => console.log(err));
        
        createVideoBuffers(group);

        console.log(`Group ${group.groupName} successfully created`);
    });
}

const createVideoBuffers = (group: Group) => {
    for(let i = 0; i < group.videoBuffer; i++) {
        ffmpeg(`${__dirname}/videos/${group.groupName}/${group.video}`)
            .setStartTime(i * 10)
            .setDuration(10)
            .output(`${__dirname}/videos/${group.groupName}/${group.groupName}_${i}.mp4`)
            .on('error', err => console.error(err))
            .run();
    }
}

export const deleteGroup = async (group: Group) => {
    fs.unlink(`${__dirname}/videos/${group.video}`, (err) => console.error(err));
    await groupModel.deleteOne({ groupID: group.groupID });
}