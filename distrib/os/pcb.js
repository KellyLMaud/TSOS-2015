///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB() {
            this.PID = _PID++;
            this.PC = 0;
            this.Accum = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.baseRegister = _CurrPartitionOfMem * 256;
            this.limitRegister = (_CurrPartitionOfMem * 256) + 255;
            this.processState = null;
        }
        PCB.prototype.printPCB = function () {
            _CPU.printPCB(this.PID, this.PC, this.Accum, this.Xreg, this.Yreg, this.Zflag);
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
