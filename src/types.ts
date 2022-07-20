export type Group = {
    groupID: number,
    groupName: string,
    video: string,
    duration: number,
    videoTime: number,
    master: Device,
    devices: Device[]
};

export type Device = {
    deviceID: number,
    ip: string
};