// 在 custom.ts 中加入積木的定義

/**
 * KSRobot_IOT V0.010
 */

//% weight=10 color=#00A6F0 icon="\uf1eb" block="KSRobot_IOT"
namespace KSRobot_IOT {
    //% blockId=make_com_post
    //% weight=50
    //% block="Make.com POST| payload %payload"
    export function makeComPost(payload: string): void {
        if (!IOT_WIFI_CONNECTED) {
            basic.showString("WiFi not connected")
            return;
        }

        let host = "hook.eu2.make.com";
        let endpoint = "/mqifgcm4mdudikywgdj97to6n3r4m3gb";
        let fullUrl = host + endpoint;

        serial.writeString("AT+HTML_POST?host="
            + fullUrl
            + "&header="
            + "Content-Type:application/json"
            + "&senddata="
            + payload
            + "=" + "\r\n");
    }
}