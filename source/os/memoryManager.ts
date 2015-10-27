///<reference path="../globals.ts" />

module TSOS {
    export class MemoryManager {

        base: number;
        limit: number;

        constructor(){

        }

        public storeProgramInMemory(code): void {
                this.base = 0;
                this.limit = 255;

            for (var i = 0; i < code.length; i++) {
                this.writeToMemory(i, code[i]);
            }
        }

        public readFromMemory(loc): any {
            return _MEM.getMemoryAtLocation(loc);
        }

        public writeToMemory(loc, code): void {
            var hexCode = this.dec2Hex(code);
            var mem = _MEM.getMemory();
            if (hexCode.length < 2)
                hexCode = "0" + hexCode;
            mem[loc] = hexCode;

            Control.updateMemTableAtLoc(Math.floor(loc / 8), loc % 8, hexCode);
        }

        public hex2Dec(hex): number {
            return parseInt(hex, 16);
        }

        public dec2Hex(dec): string {
            return dec.toString(16);
        }


    }
}