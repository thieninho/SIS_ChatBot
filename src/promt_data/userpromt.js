import { discoverDevices } from "../services/discovery";
import { winkDevice } from "../services/wink";
import { changeDeviceIP } from "../services/changeIpDevice";
import { changeConfigDevice } from "../services/changeConfigDevice";
import { openHMP, closeHMP } from "../services/hmpConnection";
import { xpressFunction } from "../services/xpressFunction";
import { changeDefaultConfig } from "../services/changeDefaultConfig"
import { openWebMonitor } from "../services/openWebMonitor";
export const companyInfo = {
    introduction: `Datalogic Group is a global technology leader ...`,
    details: `Closeness and timely response ...`,
    located: `Datalogic Vietnam LLC. F04, Lot I-4a ...`,

    "all devices": async () => {
        try {
        return await discoverDevices();
        } catch (err) {
        return String(err);
        }
    },

    "wink": async (arg) => {
    try {
        return await winkDevice(arg);
        } catch (err) {
        return String(err);
        }
    },

    "change ip": async (oldIP, newIP,  serial = null) => {
    try {
        return await changeDeviceIP(oldIP, newIP, serial);
    } catch (err) {
        return String(err);
        }
    },

    "change config": async (ip, configName =null, configKey, configValue, serial = null) => {
    try {
        const config = {
        [configKey]: configValue
        };
        return await changeConfigDevice(ip, configName, config, serial);
    } catch (err) {
        return String(err);
    }
    },

    "open hmp": async (ip, port = 1023) => {
    try {
        return await openHMP(ip, port);
    } catch (err) {
        return String(err);
        }
    },

    "close hmp": async (ip, port = 1023) => {
    try {
        return await closeHMP(ip, port);
    } catch (err) {
        return String(err);
        }
    },

    "xpress": async (fn) => {
    try {
        return await xpressFunction(fn);
    } catch (err) {
        return String(err);
        }
    },

    "change default config": async () => {
    try {
        return await changeDefaultConfig();
    } catch (err) {
        return String(err);
        }
    },
    "open web monitor": async (ip) => {
    try {
        return await openWebMonitor(ip);
    } catch (err) {
        return String(err);
        }
    },
    "update device": `Feature coming soon...`,
    };
