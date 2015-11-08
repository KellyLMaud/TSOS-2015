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
            return _MEM.getMemoryAtLocation(partition)[loc];
        }

        public writeToMemory(partition, loc, code): void {
            var row = partition * 32;

            var hexCode = this.dec2Hex(code);
            var mem = _MEM.getMemoryAtLocation(partition);
            if (hexCode.length < 2)
                hexCode = "0" + hexCode;
            mem[loc] = hexCode;

            Control.updateMemTableAtLoc(Math.floor(loc / 8) + row, loc % 8, hexCode);
        }

        public hex2Dec(hex): number {
            return parseInt(hex, 16);
        }

        public dec2Hex(dec): string {
            return dec.toString(16);
        }


    }
}