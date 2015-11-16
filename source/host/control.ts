///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            this.generateMemoryTable(3);
            //initialize memory
            _MEM = new Memory(3, 256);
            //initialize memory manager
            _MM = new MemoryManager();
            //initialize cpuScheduler
            _CPUScheduler = new CpuScheduler();


            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.


            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.


        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnSSOnOff_click(btn): void {
            if(_SingleStep){
                _SingleStep = false;
                (<HTMLButtonElement>document.getElementById("btnSingleStep")).disabled = true;
                _OsShell.shellStatus(["Single","Step", "is", "Off"]);
            }else{
                _SingleStep = true;
                (<HTMLButtonElement>document.getElementById("btnSingleStep")).disabled = false;
                _OsShell.shellStatus(["Single","Step", "is", "On"]);
            }
        }

        public static hostBtnSingleStep_click(btn): void {
            _CPU.isExecuting = true;
        }

        public static hostBtn12DONE_click(btn): void {
            (<HTMLInputElement>document.getElementById("taProgramInput")).value = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 "
                +"00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45"
                +" 00 A9 00 8D 46 00 A2 02 A0 42 FF 00";

        }

        public static hostBtnCounting_click(btn): void {
            (<HTMLInputElement>document.getElementById("taProgramInput")).value = "A9 00 8D 00 00 A9 00 8D 4B 00 A9 00 "
                +"8D 4B 00 A2 03 EC 4B 00 D0 07 A2 01 EC 00 00 D0 05 A2 00 EC 00 00 D0 26 A0 4C A2 02 FF AC 4B 00 A2 01"
                +" FF A9 01 6D 4B 00 8D 4B 00 A2 02 EC 4B 00 D0 05 A0 55 A2 02 FF A2 01 EC 00 00 D0 C5 00 00 63 6F 75 "
                +"6E 74 69 6E 67 00 68 65 6C 6C 6F 20 77 6F 72 6C 64 00";
        }

        public static hostBtn2and5_click(btn): void {
            (<HTMLInputElement>document.getElementById("taProgramInput")).value = "A9 00 8D 00 00 A9 00 8D 3B 00 A9 01 "
                +"8D 3B 00 A9 00 8D 3C 00 A9 02 8D 3C 00 A9 01 6D 3B 00 8D 3B 00 A9 03 6D 3C 00 8D 3C 00 AC 3B 00 A2 01"
                +" FF A0 3D A2 02 FF AC 3C 00 A2 01 FF 00 00 00 20 61 6E 64 20 00";
        }

        public static generateMemoryTable(partitions): void {
            _MemTable = <HTMLTableElement>document.getElementById("memoryTable");
            for (var i = 0; i < partitions; i++) {//3 partitions
                for (var j = 0; j < 32; j++) {//32 rows
                    var tr = document.createElement("tr");
                    _MemTable.appendChild(tr);
                    for (var k = 0; k < 8; k++) {//8 columns
                        var td = document.createElement("td");
                        td.id = j.toString();
                        td.innerHTML = "00";
                        tr.appendChild(td);
                    }
                }
            }
        }

        public static updateMemTableAtLoc(tableRow, tableCel, newCode): void {
            _MemTable.rows[tableRow].cells[tableCel].innerHTML = newCode;
        }

        public static clearMemTable(partitions): void {
            var count = 0;
            var rows = 32 * (partitions + 1);

            for (var j = 0; j < rows; j++) {
                for (var k = 0; k < 8; k++) {
                    this.updateMemTableAtLoc(j, k, "00");
                    count++;
                }
            }
        }

        public static updateReadyQueueDisplay(): void{
            if(_ReadyQueue.length == 1){
                this.updateProcessOne();
            }else if(_ReadyQueue.length == 2){
                this.updateProcessOne();
                this.updateProcessTwo();
            }else if (_ReadyQueue.length == 3){
                this.updateProcessOne();
                this.updateProcessTwo();
                this.updateProcessThree();
            }
        }

        public static updateProcessOne(): void{
            document.getElementById("tdP0PID").innerHTML   = _ReadyQueue[0].PID.toString();
            document.getElementById("tdP0PC").innerHTML    = _ReadyQueue[0].PC.toString();
            document.getElementById("tdP0Acc").innerHTML   = _ReadyQueue[0].Acc.toString();
            document.getElementById("tdP0XReg").innerHTML  = _ReadyQueue[0].Xreg.toString();
            document.getElementById("tdP0YReg").innerHTML  = _ReadyQueue[0].Yreg.toString();
            document.getElementById("tdP0ZFlag").innerHTML = _ReadyQueue[0].Zflag.toString();
            document.getElementById("tdP0Base").innerHTML  = _ReadyQueue[0].baseRegister.toString();
            document.getElementById("tdP0Limit").innerHTML = _ReadyQueue[0].limitRegister.toString();
            document.getElementById("tdP0State").innerHTML = _ReadyQueue[0].processState.toString();
        }

        public static updateProcessTwo(): void{
            document.getElementById("tdP1PID").innerHTML   = _ReadyQueue[1].PID.toString();
            document.getElementById("tdP1PC").innerHTML    = _ReadyQueue[1].PC.toString();
            document.getElementById("tdP1Acc").innerHTML   = _ReadyQueue[1].Acc.toString();
            document.getElementById("tdP1XReg").innerHTML  = _ReadyQueue[1].Xreg.toString();
            document.getElementById("tdP1YReg").innerHTML  = _ReadyQueue[1].Yreg.toString();
            document.getElementById("tdP1ZFlag").innerHTML = _ReadyQueue[1].Zflag.toString();
            document.getElementById("tdP1Base").innerHTML  = _ReadyQueue[1].baseRegister.toString();
            document.getElementById("tdP1Limit").innerHTML = _ReadyQueue[1].limitRegister.toString();
            document.getElementById("tdP1State").innerHTML = _ReadyQueue[1].processState.toString();
        }

        public static updateProcessThree(): void{
            document.getElementById("tdP2PID").innerHTML   = _ReadyQueue[2].PID.toString();
            document.getElementById("tdP2PC").innerHTML    = _ReadyQueue[2].PC.toString();
            document.getElementById("tdP2Acc").innerHTML   = _ReadyQueue[2].Acc.toString();
            document.getElementById("tdP2XReg").innerHTML  = _ReadyQueue[2].Xreg.toString();
            document.getElementById("tdP2YReg").innerHTML  = _ReadyQueue[2].Yreg.toString();
            document.getElementById("tdP2ZFlag").innerHTML = _ReadyQueue[2].Zflag.toString();
            document.getElementById("tdP2Base").innerHTML  = _ReadyQueue[2].baseRegister.toString();
            document.getElementById("tdP2Limit").innerHTML = _ReadyQueue[2].limitRegister.toString();
            document.getElementById("tdP2State").innerHTML = _ReadyQueue[2].processState.toString();
        }

    }
}
