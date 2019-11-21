/**
 * KSRobot_IOT V0.010
 */
//% weight=10 color=#00A6F0 icon="\uf1eb" block="KSRobot_IOT"

namespace KSRobot_IOT {

    let IOT_WIFI_CONNECTED = false
    let IOT_MQTT_CONNECTED = false
    let local_ip = "0.0.0.0"
    let ap_ip = "FFFF"
    let temp_name = ""
    let iot_receive_data = ""
    let receive_topic_name = ""
    let receive_topic_value = ""

    export enum IOT_Config {
        STATION = 0,
        STATION_AP = 1,

    }



    function WifiDataReceived(): void {
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {

            let compare_str0 = "="
            let compare_str1 = "@#$@TOPIC$"
            let compare_str2 = "@#$@STIP$"
            let compare_str3 = "@#$@APIP$"
            let strlen4 = 0
            let strlen3 = 0
            let strlen2 = 0
            let strlen1 = 0

            iot_receive_data = serial.readLine()

            if (iot_receive_data.indexOf(compare_str1) >= 0) {
                // parse mqtt topic
                strlen1 = iot_receive_data.indexOf(compare_str1) + compare_str1.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen1
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                receive_topic_name = iot_receive_data.substr(strlen1, strlen2)
                receive_topic_value = iot_receive_data.substr(strlen3, strlen4)
            }
            // parse Local IP
            if (iot_receive_data.indexOf(compare_str2) >= 0) {
                strlen1 = iot_receive_data.indexOf(compare_str2) + compare_str2.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen2
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                temp_name = iot_receive_data.substr(strlen1, strlen2)
                local_ip = iot_receive_data.substr(strlen3, strlen4)
                IOT_WIFI_CONNECTED = true
                basic.showLeds(`
                . # # # .
                # # # # #
                . # # # .
                . . # . .
                . . # . .
                `)
            }
            // parse AP information
            if (iot_receive_data.indexOf(compare_str3) >= 0) {
                strlen1 = iot_receive_data.indexOf(compare_str3) + compare_str3.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen3
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                temp_name = iot_receive_data.substr(strlen1, strlen2)
                ap_ip = iot_receive_data.substr(strlen3, strlen4)
            }






        })

    }


    /**
      * Set KSRobot WIFI IOT Module 
      * @param txd Iot module to micro:bit ; eg: SerialPin.P15
      * @param rxd micro:bit to Iot module ; eg: SerialPin.P8
      */
    //% blockId=Wifi_setup
    //% block="KSRobot WIFI Set| TXD %txd| RXD %rxd| SSID %ssid| PASSWORD %passwd| AP %ap"
    //% weight=99

    export function Wifi_setup(txd: SerialPin, rxd: SerialPin, ssid: string, passwd: string, ap: IOT_Config): void {
        serial.redirect(
            txd,   //TX
            rxd,  //RX
            BaudRate.BaudRate115200
        );
        serial.setRxBufferSize(128)
        serial.setTxBufferSize(128)
        WifiDataReceived()
        control.waitMicros(500000)
        serial.writeLine("AT+Restart=");
        control.waitMicros(500000)
        serial.writeLine("AT+AP_SET?ssid=" + ssid + "&pwd=" + passwd + "&AP=" + ap + "=");


    }

    //% blockId=Get_IP
    //% block="Get Local IP"
    export function Get_IP(): string {
        return local_ip;
    }
    //% blockId=AP_Name
    //% block="IOT AP Name"
    export function AP_Name(): string {
        return ap_ip;
    }

    //% blockId=Wifi_Connection
    //% block="Wifi Connection"
    export function Wifi_Connection(): boolean {
        return IOT_WIFI_CONNECTED;
    }

    //% blockId=ThingSpeak_set 
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="ThingSpeak Set| Write API key = %api_key| Field 1 = %field1|| Field 2 = %field2| Field 3 = %field3| Field 4 = %field4| Field 5 = %field5| Field 6 = %field6| Field 7 = %field7| Field 8 = %field8"
    export function ThingSpeak_set(api_key: string, field1: number, field2?: number, field3?: number, field4?: number, field5?: number, field6?: number, field7?: number, field8?: number): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+ThingSpeak?host=http://api.thingspeak.com/update&api_key="
                + api_key
                + "&field1="
                + field1
                + "&field2="
                + field2
                + "&field3="
                + field3
                + "&field4="
                + field4
                + "&field5="
                + field5
                + "&field6="
                + field6
                + "&field7="
                + field7
                + "&field8="
                + field8
                + "=");
        }
    }

    //% blockId=IFTTT_set
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="IFTTT Set| Event Name = %event_name| Write API key = %api_key| Value 1 = %value1|| Value 2 = %value2| Value 3 = %value3"
    export function IFTTT_set(event_name: string, api_key: string, value1: string, value2?: string, value3?: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+IFTTT?host=http://maker.ifttt.com/trigger/"
                + event_name
                + "/with/key/"
                + api_key
                + "&value1="
                + value1
                + "&value2="
                + value2
                + "&value3="
                + value3
                + "=");
        }
    }

    //% blockId=MQTT_set
    //% block="Connect MQTT| server %host| port %port| client id %clientId| username %username| password %pwd"
    export function MQTT_set(host: string, port: number, clientId: string, username: string, pwd: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+MQTT?host=" + host + "&port=" + port + "&clientId=" + clientId + "&username=" + username + "&password=" + pwd + "=");
            IOT_MQTT_CONNECTED = true
        }
    }

    //%blockId=MQTTPublish
    //% block="MQTT publish topic %topic payload %payload"
    export function MQTTPublish(topic: string, payload: string): void {
        if (IOT_MQTT_CONNECTED) {
            serial.writeLine("AT+MQTT_Publish?topic=" + topic + "&payload=" + payload + "=");
        }
    }

    //%blockId=MQTTSubscribe
    //% block="MQTT subscribe topic %topic"
    export function MQTTSubscribe(topic: string): void {
        if (IOT_MQTT_CONNECTED) {
            serial.writeLine("AT+MQTT_Subscribe?topic=" + topic + "=");
        }
    }

    //% blockId=MQTT_Data
    //% block="MQTT Topic %receivedata"
    export function MQTT_Data(receivedata: string): string {

        if (receivedata.compare(receive_topic_name) == 0) {
            return receive_topic_value;
        }
        else
            return "";

    }


    //% blockId=HTML_POST
    //% block="HTML_POST Server %host| Header %header| Body %body"
    export function HTML_POST(host: string, header: string, body: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+HTML_POST?host="
                + host
                + "&header="
                + header
                + "&senddata="
                + body);
        }
    }

    //% blockId=TCP_Client
    //% block="TCP_Client Server %host Port %port Send Data %senddata"
    export function TCP_Client(host: string, port: number, senddata: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Client?host="
                + host
                + "&port="
                + port
                + "&senddata="
                + senddata);
        }
    }

    //% blockId=TCP_Server
    //% block="TCP_Server Port %port"
    export function TCP_Server(port: number): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Server?port="
                + port
                + "=");
        }
    }

    //% blockId=TCP_SendData
    //% block="TCP Send Data %senddata"
    export function TCP_SendData(senddata: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_SendData?senddata="
                + senddata);
        }
    }

    //% blockId=TCP_Close
    //% block="TCP_Client Close Connection"
    export function TCP_Close(): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Close=");
        }
    }



    //% blockId=Receive_Data
    //% block="Receive Data"
    export function Receive_Data(): string {

        return iot_receive_data;
    }


}