import { Group } from "./types";
import * as fs from 'fs';
import { groupModel } from "./mongo";

const groups: Group[] = [];

export const getNextGroupID = async () => {
    const id = await groupModel.countDocuments();
    return id;
}

export const createGroup = async (group: Group): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        groupModel
            .create(group)
            .then(() => console.log(`Group ${group.groupName} registered successfully`))
            .catch(reject);

        resolve();
    });
}

export const unregisterGroup = (group: Group) => {
    if(!groups.includes(group)) return;
    groups.splice(groups.indexOf(group), 1);
}

export const deleteGroup = async (group: Group) => {
    if(!groups.includes(group)) return;
    fs.unlink(`${__dirname}/videos/${group.video}`, console.log);
    await groupModel.deleteOne({ groupID: group.groupID });
}

export const readVideoStats = (group: Group) => {
    if(!groups.includes(group)) return;
    fs.stat(`${__dirname}/videos/${group.video}`, (err, stats) => {
        if(err) return console.log(err);

        console.log(stats);
    });
}

export const getGroup = (groupID: number) => {
    return groups.find(group => group.groupID == groupID);
}
