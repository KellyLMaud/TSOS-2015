module TSOS {

    export class CpuScheduler {

        constructor(){

        }

        public contextSwitch(): void {
            if(_CycleCounter >= _QUANTUM && _ReadyQueue.length > 0){
                this.roundRobin();
                _CycleCounter = 0;
            }
            _CycleCounter++;
            _CPU.cycle();
        }

        public roundRobin(): void {
            //TSOS.Control.updateReadyQueueDisplay();
            //_CPU.updateCPUElements();

            _ReadyQueue[0].processState = "Waiting";
            var pcbToBeMoved = _CurrentPCB;
            _ReadyQueue.push(pcbToBeMoved);
            _ReadyQueue.shift();

            _CurrentPCB = _ReadyQueue[0];
            _RunningPID = parseInt(_ReadyQueue[0].PID);
            _ReadyQueue[0].processState = "Running";

            _CPU.PC = _CurrentPCB.PC;
            _CPU.Acc = _CurrentPCB.Accum;
            _CPU.Xreg = _CurrentPCB.Xreg;
            _CPU.Yreg = _CurrentPCB.Yreg;
            _CPU.Zflag = _CurrentPCB.Zflag;

            // Calculates the current block of memory for the process to be run
            _CurrPartitionOfMem = _CurrentPCB.baseRegister / 256;

            _CPU.isExecuting = true;

            _Kernel.krnTrace("Current cycle count > quantum of " + _QUANTUM + ", Switching context");
        }
    }
}