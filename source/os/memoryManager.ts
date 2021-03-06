///<reference path="../globals.ts" />

module TSOS {
    export class MemoryManager {

        base: number;
        limit: number;

        constructor(){

        }

        public storeProgramInMemory(partition, code): void {
            if(partition == 0){
                this.base = 0;
                this.limit = 255;
            } else if(partition == 1){
                this.base = 256;
                this.limit = 511;
            } else if(partition == 2){
                this.base = 512;
                this.limit = 1023;
            }

            for (var i = 0; i < code.length; i++) {
                this.writeToMemory(partition, i, code[i]);
            }
        }

        public readFromMemory(partition, loc): any {
            var memPartition = _MEM.getMemoryPartition(partition);
            return memPartition[loc];
        }

        public readStringFromMemory(partition, loc): string {
            var memPartition = _MEM.getMemoryPartition(partition);
            return memPartition[loc];
        }

        public writeToMemory(partition, loc, code): void {
            var row = partition * 32;

            var hexCode = this.dec2Hex(code);
            var memPartition = _MEM.getMemoryPartition(partition);
            if (hexCode.length < 2)
                hexCode = "0" + hexCode;
            memPartition[loc] = hexCode;

            Control.updateMemTableAtLoc(Math.floor(loc / 8) + row, loc % 8, hexCode);
        }

        public hex2Dec(hex): number {
            return parseInt(hex, 16);
        }

        public dec2Hex(dec): string {
            return dec.toString(16);
        }

        public stringToHex(string): string {
            var hexString = "";

            for(var i = 0; i < string.length; i++){
                hexString += string.charCodeAt(i).toString(16);
            }
            return hexString;
        }

        public hexToString(hexCode): string {
            var hex = hexCode.toString();//force conversion
            var str = "";
            for (var i = 0; i < hex.length; i += 2)
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            return str;
        }


    }
}