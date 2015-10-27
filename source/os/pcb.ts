///<reference path="../globals.ts" />

module TSOS {
    export class PCB {
        constructor(
            //process stuff
            public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public pid: number = 0,
            public code: string = "",
            // memory
            public base: number = 0,
            public limit:number = 0
        ) {

            this.pid = _pid;
            _pid++;

        }
    }
}