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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public code: String = '0') {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public printPCB(PID, PC, Accum, Xreg, Yreg, Zflag): void {
            _StdOut.putText("PID: " + PID );
            _StdOut.putText(", PC: " + (PC - 1));
            _StdOut.putText(", ACC: " + Accum);
            _StdOut.putText(", XReg: " + Xreg);
            _StdOut.putText(", YReg: " + Yreg);
            _StdOut.putText(", ZFlag: " + Zflag);
            _StdOut.advanceLine();
        }

        public clearProgram(){
            this.code = "0";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public opCodes(input): void {
            //this.code = input.toUpperCase();
            this.PC++;
            switch (input) {
                case "A9": //load accumulator with a constant
                    console.log("A9");
                    this.loadAccumConst();
                    break;
                case "AD": //load the accumulator from memory
                    console.log("AD");
                    this.loadAccumMem();
                    break;
                case "8D": //store the accumulator in memory
                    console.log("8D");
                    this.storeAccumMem();
                    break;
                case "6D": //add with carry
                    console.log("6D");
                    this.addCarry();
                    break;
                case "A2": //load the x register with a constant
                    console.log("A2");
                    this.loadXRegConst();
                    break;
                case "AE": //load the x register from memory
                    console.log("AE");
                    this.loadXRegMem();
                    break;
                case "A0": //load the y register with a constant
                    console.log("A0");
                    this.loadYRegConst();
                    break;
                case "AC": //load the y register from memory
                    console.log("AC");
                    this.loadYRegMem();
                    break;
                case "EA": //no operation
                    console.log("EA");
                    this.noOperation();
                    break;
                case "00": //break
                    console.log("00");
                    this.break();
                    break;
                case "EC": //compare a byte in memory to the x reg
                    console.log("EC");
                    this.compareXReg();
                    break;
                case "D0": //branch n bytes if Zflag = 0
                    console.log("D0");
                    this.branchNBytes();
                    break;
                case "EE": //increment the value of a byte
                    console.log("EE");
                    this.incrementByte();
                    break;
                case "FF": //system call
                    console.log("FF");
                    this.systemCall();
                    break;
                default:
                    _StdOut.putText("Undefined OP Code " + input + ".");
                    _StdOut.advanceLine();
                    _CPU.isExecuting = false;
            }
        }

        public loadAccumConst(){
            //load the accumulator with a constant
            this.Acc = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;

        }

        public loadAccumMem(){
            //load the accumulator from memory
            this.Acc = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;
            this.PC++;
        }

        public storeAccumMem(){
            //store the accumulator in memory
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            _MM.writeToMemory(_CurrPartitionOfMem, location, _MM.dec2Hex(this.Acc));
            this.PC++;
            this.PC++;
        }

        public addCarry(){
            //add with carry
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.Acc += _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            this.PC++;
            this.PC++;
        }

        public loadXRegConst(){
            //load the x register with a constant
            this.Xreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;
        }

        public loadXRegMem(){
            //load the x register from memory
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.Xreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            this.PC++;
            this.PC++;
        }

        public loadYRegConst(){
            //load the y register with a constant
            this.Yreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            this.PC++;
        }

        public loadYRegMem(){
            //load the y register from memory
            var adr = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            //console.log(adr);
            this.Yreg = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, adr));
            //console.log(this.Yreg);
            this.PC++;
            this.PC++;
        }

        public noOperation(){
            //no operation
            this.isExecuting = false;
            _Kernel.krnTrace("break");
        }

        public break(){
            //break
            this.isExecuting = false;
            this.finishProgram();
            _CPUScheduler.breakContextSwitch();
            _OsShell.putPrompt();
        }

        public compareXReg(){
            //compare a byte in memory to the x reg
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            var memoryValue = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            this.Zflag = (memoryValue === this.Xreg) ? 1 : 0;
            this.PC++;
            this.PC++;
        }

        public branchNBytes(){


            if (this.Zflag===0){
                //console.log("this.PC before converting and reading " + this.PC);
                this.PC +=_MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC++))+1 ;
                //console.log("this.PC after converting and reading " + this.PC);
                //console.log("_CurrentPCB.base " + _CurrentPCB.baseRegister);
                if (this.PC>=256){
                    //console.log("this.PC if >= 256 before " + this.PC);
                    this.PC-=256
                    //console.log("this.PC if >= 256 after " + this.PC);
                }
            }
            else {
                this.PC++;
                //console.log("this.PC else " + this.PC);
            }

            _Kernel.krnTrace("branch");

        }

        public incrementByte(){
            //increment the value of a byte
            var location = _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, this.PC));
            var value = 1 + _MM.hex2Dec(_MM.readFromMemory(_CurrPartitionOfMem, location));
            _MM.writeToMemory(_CurrPartitionOfMem, location, value);
            this.PC++;
            this.PC++;
        }

        public systemCall(){
            //system call
            if(this.Xreg == 1){
                _StdOut.putText(this.Yreg.toString());
            }
            else if(this.Xreg == 2){
                var adr = this.Yreg;
                var char = _MM.readFromMemory(_CurrPartitionOfMem, adr);
                while(char != "00"){
                    _StdOut.putText(String.fromCharCode(_MM.hex2Dec(char)));
                    adr ++;
                    char = _MM.readFromMemory(_CurrPartitionOfMem, adr);
                }
            }else{
                _StdOut.putText("XReg is supposed to be a 1 or a 2");
                _CPU.isExecuting = false;
            }
        }

        public finishProgram(): void{
            _StdOut.advanceLine();
            _CurrentPCB.PC = this.PC;
            _CurrentPCB.Accum = this.Acc;
            _CurrentPCB.Xreg = this.Xreg;
            _CurrentPCB.Yreg = this.Yreg;
            _CurrentPCB.Zflag = this.Zflag;
            _CurrentPCB.printPCB();
        }

        public printCPUElements(): void {
            document.getElementById("tdPC").innerHTML = this.PC.toString();
            document.getElementById("tdIR").innerHTML = _MM.readFromMemory(_CurrPartitionOfMem, this.PC);
            document.getElementById("tdAccum").innerHTML = this.Acc.toString();
            document.getElementById("tdXReg").innerHTML = this.Xreg.toString();
            document.getElementById("tdYReg").innerHTML = this.Yreg.toString();
            document.getElementById("tdZFlag").innerHTML = this.Zflag.toString();
        }

        public updateCPUElements(_CurrentPCB: PCB): void {
            this.PC = _CurrentPCB.PC;
            this.Acc = _CurrentPCB.Acc;
            this.Xreg = _CurrentPCB.Xreg;
            this.Yreg = _CurrentPCB.Yreg;
            this.Zflag = _CurrentPCB.Zflag;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            console.log("_CurrPartitionOfMem = " +_CurrPartitionOfMem);
            console.log("this.PC = " + this.PC);
            var opCode = _MM.readFromMemory(_CurrPartitionOfMem, this.PC);
            console.log("_CurrPartitionOfMem = " +_CurrPartitionOfMem);
            console.log("this.PC = " + this.PC);
            this.printCPUElements();
            //this.updateCPUElements(_CurrentPCB);
            console.log("opCode = " + opCode);
            if(this.Yreg >= _CurrentPCB.baseRegister + 256){
                this.break();
                _Kernel.krnTrace('invalid memory access');
            }else{
                this.opCodes(opCode);
            }
            //console.log("PC = " + this.PC);

            if (_SingleStep){
                this.isExecuting = false;
            }
        }
    }
}

