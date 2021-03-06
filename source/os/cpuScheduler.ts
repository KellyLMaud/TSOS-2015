module TSOS {

    export class CpuScheduler {

        constructor(){

        }

        public contextSwitchCheck(): void {
            if(_SchedulingAlgorithm == "rr"){
                if(_CycleCounter >= _QUANTUM && _ReadyQueue.length > 0){
                    this.roundRobin();
                    _CycleCounter = 0;
                }
            }else if(_SchedulingAlgorithm == "fcfs"){
                this.firstComeFirstServed();
                _CycleCounter = 0;
            } else if(_SchedulingAlgorithm == "priority"){
                this.priority();
            }

            _CycleCounter++;
        }

        public firstComeFirstServed(){
            _CPU.printCPUElements();

        }

        public roundRobin(): void {
            _CPU.printCPUElements();

            _ReadyQueue[0].processState = "Waiting";
            var pcbSwitch = _ReadyQueue.shift();//_CurrentPCB;
            pcbSwitch.PC = _CPU.PC;
            pcbSwitch.Acc = _CPU.Acc;
            pcbSwitch.Xreg = _CPU.Xreg;
            pcbSwitch.Yreg = _CPU.Yreg;
            pcbSwitch.Zflag = _CPU.Zflag;
            _ReadyQueue.push(pcbSwitch);

            _CurrentPCB = _ReadyQueue[0];
            _CPU.updateCPUElements(_CurrentPCB);
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
        }

        public breakContextSwitch(): void{
            _CycleCounter = 0;
            if (_ReadyQueue.length > 1) {
                _CPU.isExecuting = true;
                _ReadyQueue[0].processState = "Waiting";
                var pcbSwitch = _ReadyQueue.shift();
                pcbSwitch.processState = "Terminated";
                Control.clearReadyQueueDisplayRow(pcbSwitch, _ReadyQueue.length);
                pcbSwitch.PC = _CPU.PC;
                pcbSwitch.Acc = _CPU.Acc;
                pcbSwitch.Xreg = _CPU.Xreg;
                pcbSwitch.Yreg = _CPU.Yreg;
                pcbSwitch.Zflag = _CPU.Zflag;
                _CurrentPCB = _ReadyQueue[0];
                _CurrentPCB.processState = "Running";
                _CurrPartitionOfMem = _CurrentPCB.baseRegister / 256;
                _CPU.updateCPUElements(_CurrentPCB);
            }else {
                _ReadyQueue[0].processState = "Terminated";
                Control.clearReadyQueueDisplayRow(_ReadyQueue[0], 0);
                _ReadyQueue.shift();
                _CPU.isExecuting = false;
            }

        }


        public priority(): void {
            _ResidentList.sort(function(a, b){return a.priority-b.priority});

        }


    }

}