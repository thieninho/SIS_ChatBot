import { discoverDevices } from "../services/discovery";
import { winkDevice } from "../services/wink";
import { changeDeviceIP } from "../services/changeIpDevice";
import { changeConfigDevice } from "../services/changeConfigDevice";
import { openHMP, closeHMP } from "../services/hmpConnection";
import { xpressFunction } from "../services/xpressFunction";
import { changeDefaultConfig } from "../services/changeDefaultConfig"
import { openWebMonitor } from "../services/openWebMonitor";
import { listXPress } from "../services/listXPress";
import { sendReportEmail } from "../services/sendReportEmail";
import { restartDevice } from "../services/restartDevice";
import { xpressFunctionDirectly } from "../services/xpressFuncDirectly";
import { getDeviceStatistics } from "../services/getDeviceStats";
import { decodeFunction } from "../services/decode";
export const companyInfo = {
    "introduction": `Datalogic is a global technology leader in the automatic data capture and factory automation markets, specialized in the designing and production of bar code readers, mobile computers, sensors for detection, measurement and safety, RFID, vision and laser marking systems.`,
    "located": `DATALOGIC VIETNAM LLC. F04, Lot I-4a Saigon Hi-Tech Park, Long Thanh My Ward, Thu Duc City Ho Chi Minh City Vietnam.`,

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
    "restart": async (arg) => {
    try {
        return await restartDevice(arg);
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

    "xpressFunctionDirectly": async (fn, ip) => {
        try {
            return await xpressFunctionDirectly(fn, ip);
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
    
    "list xpress": async (ip) => {
    try {
        return await listXPress(ip);
    } catch (err) {
        return String(err);
        }
    },
    "get statistics": async (ip) => {
        try {
            return await getDeviceStatistics(ip);
        } catch (err) {
            return String(err);
        }
    },
    "decode": async (ip) => {
    try {
            return await decodeFunction(ip);
        } catch (err) {
            return String(err);
        }
    },

    "send report": async (ip, email) => {
    try {
        const reply = await companyInfo["get statistics"](ip);
        console.log(reply.results)
        const functions = reply.results;
        return await sendReportEmail(ip, email, functions);
    } catch (err) {
        return String(err);
    }
    },
    };
