export type Group = {
    groupID: number,
    groupName: string,
    video: string,
    duration: number,
    videoBuffer: number,
    currentVideoBuffer: number,
    devices: Device[]
};

export type Device = {
    deviceID: number,
    ip: string
};