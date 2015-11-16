var TSOS;
(function (TSOS) {
    var CpuScheduler = (function () {
        function CpuScheduler() {
        }
        CpuScheduler.prototype.contextSwitchCheck = function () {
            if (_CycleCounter >= _QUANTUM && _ReadyQueue.length > 0) {
                this.roundRobin();
                _CycleCounter = 0;
            }
            _CycleCounter++;
            console.log("_CycleCounter++  " + _CycleCounter);
            //_CPU.cycle();
        };
        CpuScheduler.prototype.roundRobin = function () {
            console.log("ROUNDROBINCONTEXTSWITCH");
            //UpdateReadyQueue
            _CPU.printCPUElements();
            _ReadyQueue[0].processState = "Waiting";
            var pcbSwitch = _ReadyQueue.shift(); //_CurrentPCB;
            pcbSwitch.PC = _CPU.PC;
            pcbSwitch.Acc = _CPU.Acc;
            pcbSwitch.Xreg = _CPU.Xreg;
            pcbSwitch.Yreg = _CPU.Yreg;
            pcbSwitch.Zflag = _CPU.Zflag;
            _ReadyQueue.push(pcbSwitch);
            _CurrentPCB = _ReadyQueue[0];
            _CPU.updateCPUElements(_CurrentPCB);
            console.log("_CurrentPCB");
            console.log(_CurrentPCB);
            _RunningPID = parseInt(_ReadyQueue[0].PID);
            _ReadyQueue[0].processState = "Running";
            _CPU.PC = _CurrentPCB.PC;
            _CPU.Acc = _CurrentPCB.Acc;
            _CPU.Xreg = _CurrentPCB.Xreg;
            _CPU.Yreg = _CurrentPCB.Yreg;
            _CPU.Zflag = _CurrentPCB.Zflag;
            _CurrPartitionOfMem = _CurrentPCB.baseRegister / 256;
            _CPU.isExecuting = true;
            _Kernel.krnTrace("Current cycle count of " + _CycleCounter + " > quantum of " + _QUANTUM + ", Switching context");
        };
        CpuScheduler.prototype.breakContextSwitch = function () {
            _CycleCounter = 0;
            if (_ReadyQueue.length > 1) {
                _CPU.isExecuting = true;
                _ReadyQueue[0].processState = "Waiting";
                var pcbSwitch = _ReadyQueue.shift(); //_CurrentPCB;
                pcbSwitch.PC = _CPU.PC;
                pcbSwitch.Acc = _CPU.Acc;
                pcbSwitch.Xreg = _CPU.Xreg;
                pcbSwitch.Yreg = _CPU.Yreg;
                pcbSwitch.Zflag = _CPU.Zflag;
                //_ReadyQueue.push(pcbSwitch);
                _CurrentPCB = _ReadyQueue[0];
                _CPU.updateCPUElements(_CurrentPCB);
            }
            else {
                _CPU.isExecuting = false;
            }
        };
        return CpuScheduler;
    })();
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
