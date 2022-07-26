import mongoose from "mongoose"
import { Device, Group } from "./types";

export const connect = () => {
    mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:27017`);
}

mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

export const groupSchema = new mongoose.Schema<Group>({
    groupID: { type: Number, required: true, unique: true },
    groupName: { type: String, required: true, unique: true },
    video: { type: String, required: true },
    duration: { type: Number, required: true },
    videoBuffer: { type: Number, required: true },
    currentVideoBuffer: { type: Number, required: true },
    devices: {
        type: [
            {
                deviceID: { type: Number, required: true },
                ip: { type: String, required: true }
            }
        ],
        required: true
    }
});

export const deviceSchema = new mongoose.Schema<Device>({
    deviceID: { type: Number, required: true },
    ip: { type: String, required: true }
});

export const groupModel = mongoose.model("groups", groupSchema);
export const deviceModel = mongoose.model("devices", deviceSchema);