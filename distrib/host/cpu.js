///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, code) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (code === void 0) { code = '0'; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.code = code;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.printPCB = function (PID, PC, Accum, Xreg, Yreg, Zflag) {
            _StdOut.putText("PID: " + PID);
            _StdOut.putText(", PC: " + (PC - 1));
            _StdOut.putText(", ACC: " + Accum);
            _StdOut.putText(", XReg: " + Xreg);
            _StdOut.putText(", YReg: " + Yreg);
            _StdOut.putText(", ZFlag: " + Zflag);
            _StdOut.advanceLine();
        };
        Cpu.prototype.clearProgram = function () {
            this.code = "0";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.opCodes = function (input) {
            //this.code = input.toUpperCase();
            this.PC++;
            switch (input) {
                case "A9":
                    console.log("A9");
                    this.loadAccumConst();
                    break;
                case "AD":
                    console.log("AD");
                    this.loadAccumMem();
                    break;
                case "8D":
                    console.log("8D");
                    this.storeAccumMem();
                    break;
                case "6D":
                    console.log("6D");
                    this.addCarry();
                    break;
                case "A2":
                    console.log("A2");
                    this.loadXRegConst();
                    break;
                case "AE":
                    console.log("AE");
                    this.loadXRegMem();
                    break;
                case "A0":
                    console.log("A0");
                    this.loadYRegConst();
                    break;
                case "AC":
                    console.log("AC");
                    this.loadYRegMem();
                    break;
                case "EA":
                    console.log("EA");
                    this.noOperation();
                    break;
                case "00":
                    console.log("00");
                    this.break();
                    break;
                case "EC":
                    console.log("EC");
                    this.compareXReg();
                    break;
                case "D0":
                    console.log("D0");
                    this.branchNBytes();
                    break;
                case "EE":
                    console.log("EE");
                    this.incrementByte();
                    break;
                case "FF":
                    console.log("FF");
                    this.systemCall();
                    break;
                default:
                    _StdOut.putText("Undefined OP Code " + input + ".");
                    _StdOut.advanceLine();
                    _CPU.isExecuting = false;
            }
        };
        Cpu.prototype.loadAccumConst = function () {
            //load the accumulator with a constant
            this.Acc = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;
        };
        Cpu.prototype.loadAccumMem = function () {
            //load the accumulator from memory
            this.Acc = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.storeAccumMem = function () {
            //store the accumulator in memory
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            _MM.writeToMemory(_CurrPartitionOfMem, location, _MM.dec2Hex(this.Acc));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.addCarry = function () {
            //add with carry
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.Acc += _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.loadXRegConst = function () {
            //load the x register with a constant
            this.Xreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;
        };
        Cpu.prototype.loadXRegMem = function () {
            //load the x register from memory
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.Xreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.loadYRegConst = function () {
            //load the y register with a constant
            this.Yreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;
        };
        Cpu.prototype.loadYRegMem = function () {
            //load the y register from memory
            var adr = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            //console.log(adr);
            this.Yreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, adr));
            //console.log(this.Yreg);
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.noOperation = function () {
            //no operation
            this.isExecuting = false;
            _Kernel.krnTrace("break");
        };
        Cpu.prototype.break = function () {
            //break
            this.isExecuting = false;
            this.finishProgram();
            _CPUScheduler.breakContextSwitch();
            _OsShell.putPrompt();
        };
        Cpu.prototype.compareXReg = function () {
            //compare a byte in memory to the x reg
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            var memoryValue = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            this.Zflag = (memoryValue === this.Xreg) ? 1 : 0;
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.branchNBytes = function () {
            //branch n bytes if Zflag = 0
            if (this.Zflag === 0) {
                var branchSpan = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
                this.PC++;
                this.PC = this.PC + branchSpan;
                if (this.PC >= 256) {
                    this.PC = this.PC - 256;
                }
            }
            else {
                this.PC++;
            }
        };
        Cpu.prototype.incrementByte = function () {
            //increment the value of a byte
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            var value = 1 + _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            _MM.writeToMemory(_CurrPartitionOfMem, location, value);
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.systemCall = function () {
            //system call
            if (this.Xreg == 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg == 2) {
                var adr = this.Yreg;
                var char = _MM.readFromMemory(_CurrPartitionOfMem, adr);
                while (char != "00") {
                    _StdOut.putText(String.fromCharCode(_MM.hex2Dec(char)));
                    adr++;
                    char = _MM.readFromMemory(_CurrPartitionOfMem, adr);
                }
            }
            else {
                _StdOut.putText("XReg is supposed to be a 1 or a 2");
                _CPU.isExecuting = false;
            }
        };
        Cpu.prototype.finishProgram = function () {
            _StdOut.advanceLine();
            _CurrentPCB.PC = this.PC;
            _CurrentPCB.Accum = this.Acc;
            _CurrentPCB.Xreg = this.Xreg;
            _CurrentPCB.Yreg = this.Yreg;
            _CurrentPCB.Zflag = this.Zflag;
            _CurrentPCB.printPCB();
        };
        Cpu.prototype.printCPUElements = function () {
            document.getElementById("tdPC").innerHTML = this.PC.toString();
            document.getElementById("tdIR").innerHTML = _MM.readFromMemory(_CurrPartitionOfMem, this.PC);
            document.getElementById("tdAccum").innerHTML = this.Acc.toString();
            document.getElementById("tdXReg").innerHTML = this.Xreg.toString();
            document.getElementById("tdYReg").innerHTML = this.Yreg.toString();
            document.getElementById("tdZFlag").innerHTML = this.Zflag.toString();
            //UpdateReadyQueue
        };
        Cpu.prototype.updateCPUElements = function (_CurrentPCB) {
            this.PC = _CurrentPCB.PC;
            this.Acc = _CurrentPCB.Acc;
            this.Xreg = _CurrentPCB.Xreg;
            this.Yreg = _CurrentPCB.Yreg;
            this.Zflag = _CurrentPCB.Zflag;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            var opCode = _MM.readFromMemory(_CurrPartitionOfMem, this.PC);
            console.log("_CurrPartitionOfMem = " + _CurrPartitionOfMem);
            console.log("this.PC = " + this.PC);
            this.printCPUElements();
            console.log("opCode = " + opCode);
            this.opCodes(opCode);
            //console.log("PC = " + this.PC);
            if (_SingleStep) {
                this.isExecuting = false;
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
