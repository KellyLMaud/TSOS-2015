///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(
            //process stuff
            PC, Acc, Xreg, Yreg, Zflag, pid, code, 
            // memory
            base, limit) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (pid === void 0) { pid = 0; }
            if (code === void 0) { code = ""; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.pid = pid;
            this.code = code;
            this.base = base;
            this.limit = limit;
            this.pid = _pid;
            _pid++;
        }
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
