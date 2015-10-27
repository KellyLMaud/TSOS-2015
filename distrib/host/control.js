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
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            //initialize memory
            _MEM = new TSOS.Memory(256);
            //initialize memory manager
            _MM = new TSOS.MemoryManager();
            //initialize PCB
            _currentPCB = new TSOS.PCB();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
            this.generateMemoryTable();
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.hostBtnSSOnOff_click = function (btn) {
            if (_SingleStep) {
                _SingleStep = false;
                document.getElementById("btnSingleStep").disabled = true;
                _OsShell.shellStatus(["Single", "Step", "is", "Off"]);
            }
            else {
                _SingleStep = true;
                document.getElementById("btnSingleStep").disabled = false;
                _OsShell.shellStatus(["Single", "Step", "is", "On"]);
            }
        };
        Control.hostBtnSingleStep_click = function (btn) {
            _CPU.isExecuting = true;
        };
        Control.hostBtn12DONE_click = function (btn) {
            document.getElementById("taProgramInput").value = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 "
                + "00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45"
                + " 00 A9 00 8D 46 00 A2 02 A0 42 FF 00";
        };
        Control.hostBtnCounting_click = function (btn) {
            document.getElementById("taProgramInput").value = "A9 00 8D 00 00 A9 00 8D 4B 00 A9 00 "
                + "8D 4B 00 A2 03 EC 4B 00 D0 07 A2 01 EC 00 00 D0 05 A2 00 EC 00 00 D0 26 A0 4C A2 02 FF AC 4B 00 A2 01"
                + " FF A9 01 6D 4B 00 8D 4B 00 A2 02 EC 4B 00 D0 05 A0 55 A2 02 FF A2 01 EC 00 00 D0 C5 00 00 63 6F 75 "
                + "6E 74 69 6E 67 00 68 65 6C 6C 6F 20 77 6F 72 6C 64 00";
        };
        Control.hostBtn2and5_click = function (btn) {
            document.getElementById("taProgramInput").value = "A9 00 8D 00 00 A9 00 8D 3B 00 A9 01 "
                + "8D 3B 00 A9 00 8D 3C 00 A9 02 8D 3C 00 A9 01 6D 3B 00 8D 3B 00 A9 03 6D 3C 00 8D 3C 00 AC 3B 00 A2 01"
                + " FF A0 3D A2 02 FF AC 3C 00 A2 01 FF 00 00 00 20 61 6E 64 20 00";
        };
        Control.generateMemoryTable = function () {
            _MemTable = document.getElementById("memoryTable");
            for (var j = 0; j < 32; j++) {
                var tr = document.createElement("tr");
                _MemTable.appendChild(tr);
                for (var k = 0; k < 8; k++) {
                    var td = document.createElement("td");
                    td.id = j.toString();
                    td.innerHTML = "00";
                    tr.appendChild(td);
                }
            }
        };
        Control.updateMemTableAtLoc = function (tableRow, tableCel, newCode) {
            _MemTable.rows[tableRow].cells[tableCel].innerHTML = newCode;
        };
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
