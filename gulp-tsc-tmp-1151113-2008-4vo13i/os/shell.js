///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- displays current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- displays the users location.");
            this.commandList[this.commandList.length] = sc;
            // whichshouldieat <list>
            sc = new TSOS.ShellCommand(this.shellWhichshouldieat, "whichshouldieat", "<list> - chooses a food item from the list.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- validates user code in the text area.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - displays the string in the status bar.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- tests the blue screen of death.");
            this.commandList[this.commandList.length] = sc;
            // run <string>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<string> - runs the program with the pid specified.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "- clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", "- execute all programs at once.");
            this.commandList[this.commandList.length] = sc;
            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - set the Round Robin Quantum.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- display PIDs of all active processes.");
            this.commandList[this.commandList.length] = sc;
            // kill <pid>
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - kill an active process.");
            this.commandList[this.commandList.length] = sc;
            // create <filename>
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<fileame> - creates the file, filename.");
            this.commandList[this.commandList.length] = sc;
            // read <filename>
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<filename> - read and display the contents of filename.");
            this.commandList[this.commandList.length] = sc;
            // write <filename> "data"
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<filename> 'data' - write the data inside the quotes to filename.");
            this.commandList[this.commandList.length] = sc;
            // delete <filename>
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<filename> - remove the filename and display a message.");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", " - initialize all blocks in all sectors in all tracks.");
            this.commandList[this.commandList.length] = sc;
            // ls
            sc = new TSOS.ShellCommand(this.shellLs, "ls", " - list files currently stored on the disk.");
            this.commandList[this.commandList.length] = sc;
            // setschedule [rr, tcfs, priority]
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<rr, fcfs, priority> - set the cpu scheduling algorithm by selecting one from the list.");
            this.commandList[this.commandList.length] = sc;
            // getschedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", " - return currently selected cpu scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("ver - displays the current version data.");
                        break;
                    case "help":
                        _StdOut.putText("help - this is the help command. seek help.");
                        break;
                    case "shutdown":
                        _StdOut.putText("shutdown - Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("cls - Clears the screen and resets the cursor position.");
                        break;
                    case "man":
                        _StdOut.putText("man <topic> - Displays the MANual page for <topic>.");
                        break;
                    case "trace":
                        _StdOut.putText("trace <on | off> - Turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("rot13 <string> - Does rot13 obfuscation on <string>.");
                        break;
                    case "prompt":
                        _StdOut.putText("prompt <string> - Sets the prompt.");
                        break;
                    case "date":
                        _StdOut.putText("date - displays the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("whereami- displays the users current location.");
                        break;
                    case "whatshouldieat":
                        _StdOut.putText("whichshouldieat <food items> - display a food option for the user to eat.");
                        break;
                    case "load":
                        _StdOut.putText("load - validates user code in the text area.");
                        break;
                    case "status":
                        _StdOut.putText("status <string> - displays the string in the status bar.");
                        break;
                    case "bsod":
                        _StdOut.putText("bsod - tests the blue screen of death.");
                        break;
                    case "run":
                        _StdOut.putText("run <string pid> - runs the program with the pid specified.");
                        break;
                    case "clearmem":
                        _StdOut.putText("clearmem - clear all memory partitions.");
                        break;
                    case "runall":
                        _StdOut.putText("runall - execute all programs at once");
                        break;
                    case "quantum":
                        _StdOut.putText("quantum <int> - set the Round Robin quantum.");
                        break;
                    case "ps":
                        _StdOut.putText("ps - displays the PIDs of active processes.");
                        break;
                    case "kill":
                        _StdOut.putText("kill <pid> - kill an active process.");
                        break;
                    case "create":
                        _StdOut.putText("create <filename> - create the file, filename.");
                        break;
                    case "read":
                        _StdOut.putText("read <filename> - read and display the contents of filename.");
                        break;
                    case "write":
                        _StdOut.putText("write <filename> 'data' - write the data in the quotes to filename.");
                        break;
                    case "delete":
                        _StdOut.putText("delete <filename> - remove filename from storage.");
                        break;
                    case "format":
                        _StdOut.putText("format - initialize all blocks in all sectors in all tracks.");
                        break;
                    case "ls":
                        _StdOut.putText("ls - list the files currently stored on the disk.");
                        break;
                    case "setschedule":
                        _StdOut.putText("setschedule [rr, fcfs, priority] - set the cpu scheduling algorithm by selecting one from the list.");
                        break;
                    case "getschedule":
                        _StdOut.putText("getschedule - return currently selected cpu scheduling algorithm.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            var date = new Date().toLocaleDateString();
            _StdOut.putText(date);
        };
        Shell.prototype.shellWhereami = function (args) {
            _StdOut.putText("You're in the CLI of the coolest OS ever designed.");
        };
        Shell.prototype.shellWhichshouldieat = function (args) {
            if (args.length > 0) {
                var food = args[Math.floor(Math.random() * args.length)];
                _StdOut.putText(food);
            }
        };
        Shell.prototype.shellLoad = function (args) {
            var priority = 0;
            if (args > 0) {
                priority = args[0];
            }
            _ProgramInput = document.getElementById("taProgramInput").value.trim().toUpperCase();
            var isValid = true;
            if (_ProgramInput.length > 0) {
                for (var i = 0; i < _ProgramInput.length; i++) {
                    var c = _ProgramInput[i];
                    if (c != 'A' && c != 'B' && c != 'C' && c != 'D' && c != 'E' && c != 'F' && c != ' ' && c != '1' && c != '2' && c != '3' && c != '4' && c != '5' && c != '6' && c != '7' && c != '8' && c != '9' && c != '0') {
                        isValid = false;
                    }
                }
                if (isValid) {
                    _ProgramInput = _ProgramInput.replace(/\n/g, " ").split(" ");
                    var baseRegister;
                    var limitRegister;
                    if (_CurrPartitionOfMem < 2) {
                        _CurrPartitionOfMem++;
                        baseRegister = _CurrPartitionOfMem * 256;
                        limitRegister = (_CurrPartitionOfMem * 256) + 255;
                    }
                    else {
                        _StdOut.putText("Memory full");
                        return false;
                    }
                    _CurrentPCB = new TSOS.PCB();
                    _CurrentPCB.processState = "Resident";
                    _CurrentPCB.priority = priority;
                    if (_CurrPartitionOfMem >= 2) {
                        _CurrentPCB.baseRegister = baseRegister;
                        _CurrentPCB.limitRegister = limitRegister;
                    }
                    _ResidentList.push(_CurrentPCB);
                    if (_CurrPartitionOfMem <= 2) {
                        _MM.storeProgramInMemory(_CurrPartitionOfMem, _ProgramInput);
                        _MEM.memory[_CurrPartitionOfMem] = _ProgramInput;
                    }
                    _StdOut.putText("Program successfully loaded");
                    _StdOut.advanceLine();
                    _StdOut.putText("PID = " + _CurrentPCB.PID);
                }
                else {
                    _StdOut.putText("User Program Input is Invalid");
                }
            }
            else {
                _StdOut.putText("No code in User Program Input to load");
            }
        };
        Shell.prototype.shellStatus = function (args) {
            var newstatus = "";
            if (args.length > 0) {
                for (var i = 0; i < args.length; i++) {
                    newstatus = newstatus + " " + args[i];
                }
            }
            document.getElementById("status").innerHTML = newstatus;
        };
        Shell.prototype.shellBSOD = function (args) {
            _Kernel.krnTrapError("error");
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                if (_MEM.isEmpty()) {
                    _StdOut.putText('Nothing is in memory');
                }
                else {
                    _RunningPID = parseInt(args[0]);
                    var residentPID = -1;
                    var residentPIDPartition = -1;
                    for (var i = 0; i < _ResidentList.length; i++) {
                        console.log("RunningPID = " + _RunningPID);
                        if (_ResidentList[i].PID == _RunningPID) {
                            residentPID = i;
                            residentPIDPartition = _ResidentList[i].baseRegister / 256;
                            _CurrentPCB = _ResidentList[i];
                            _ReadyQueue.push(_ResidentList[i]);
                            _ResidentList.splice(i, 1);
                        }
                    }
                    if (residentPID == -1) {
                        _StdOut.putText('Input correct PID');
                    }
                    else {
                        _CurrPartitionOfMem = residentPIDPartition;
                        _CPU.clearProgram();
                        _CycleCounter = 0;
                        _CPU.isExecuting = true;
                    }
                }
            }
            else {
                _StdOut.putText("Input PID");
            }
        };
        Shell.prototype.shellClearmem = function (args) {
            _MEM.clearMemory();
            _CurrPartitionOfMem = -1;
            _StdOut.putText("Memory cleared");
        };
        Shell.prototype.shellRunall = function (args) {
            _ReadyQueue = [];
            for (var i = 0; i < _ResidentList.length; i++) {
                _ReadyQueue.push(_ResidentList[i]);
                if (i > 0) {
                    _ReadyQueue[i].processState = "Waiting";
                }
            }
            _CurrentPCB = _ReadyQueue[0];
            _CurrPartitionOfMem = _CurrentPCB.baseRegister / 256;
            _CurrentPCB.processState = "Running";
            _RunningPID = parseInt(_ReadyQueue[0].PID);
            _ReadyQueue[0].processState = "Running";
            _CPU.clearProgram();
            _CycleCounter = 0;
            _CPU.isExecuting = true;
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                _QUANTUM = args[0];
                _StdOut.putText("Quantum has been set to " + _QUANTUM);
            }
            else {
                _StdOut.putText("quantum <int> Please supply a quantum number.");
            }
        };
        Shell.prototype.shellPs = function (args) {
            if (_ReadyQueue.length == 0) {
                _StdOut.putText("There are no active processes.");
                _StdOut.advanceLine();
            }
            else {
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    _StdOut.putText("PID: " + _ReadyQueue[i].PID);
                    _StdOut.advanceLine();
                }
            }
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var terminatePID = args[0];
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    if (_ReadyQueue[i].PID == terminatePID) {
                        _ReadyQueue[i].processState = "Terminated";
                        TSOS.Control.clearReadyQueueDisplayRow(_ReadyQueue[i], _ReadyQueue.length);
                        _ReadyQueue.splice(i, 1);
                        if (_ReadyQueue.length > 0) {
                            _CurrPartitionOfMem = _ReadyQueue[0].baseRegister / 256;
                            _CurrentPCB = _ReadyQueue[0];
                            _RunningPID = parseInt(_ReadyQueue[0].PID);
                            _ReadyQueue[0].processState = "Running";
                            _CPU.PC = _CurrentPCB.PC;
                            _CPU.Acc = _CurrentPCB.Acc;
                            _CPU.Xreg = _CurrentPCB.Xreg;
                            _CPU.Yreg = _CurrentPCB.Yreg;
                            _CPU.Zflag = _CurrentPCB.Zflag;
                        }
                        else {
                            _CPU.isExecuting = false;
                        }
                    }
                }
            }
        };
        //<rr, fcfs, priority> - set the cpu scheduling algorithm by selecting one from the list.
        Shell.prototype.shellSetSchedule = function (args) {
            var sched = args[0];
            if (sched === "rr") {
                _SchedulingAlgorithm = sched;
                _StdOut.putText("CPU Scheduling algorithm set to Round Robin");
            }
            else if (sched === "fcfs") {
                _SchedulingAlgorithm = sched;
                _StdOut.putText("CPU Scheduling algorithm set to First Come First Served");
            }
            else if (sched === "priority") {
                _SchedulingAlgorithm = sched;
                _StdOut.putText("CPU Scheduling algorithm set to Priority");
                _CPUScheduler.priority();
            }
            else {
                _StdOut.putText("invalid scheduling algorithm.");
            }
        };
        //return currently selected cpu scheduling algorithm.
        Shell.prototype.shellGetSchedule = function (args) {
            if (_SchedulingAlgorithm === "rr") {
                _StdOut.putText("Round Robin");
            }
            else if (_SchedulingAlgorithm === "fcfs") {
                _StdOut.putText("First Come First Serve");
            }
            else if (_SchedulingAlgorithm === "priority") {
                _StdOut.putText("Priority");
            }
        };
        // file system
        Shell.prototype.shellCreate = function (args) {
            if (diskIsFormatted) {
                if (args.length === 1) {
                    var fileName = args[0];
                    if (fileName.charAt(0) == ".") {
                        _StdOut.putText("File name cannot start with \".\"");
                    }
                    else {
                        var createSuccessful = _fsDD.createFile(fileName);
                        if (createSuccessful) {
                            _StdOut.putText("Successfully created file \"" + fileName + "\"");
                        }
                        else {
                            _StdOut.putText("Error creating file, \"" + fileName + "\"");
                        }
                    }
                }
                else {
                    _StdOut.putText("Error creating file, supplied parameters is wrong.");
                }
            }
            else {
                _StdOut.putText("Please format disk first.");
            }
        };
        Shell.prototype.shellRead = function (args) {
            if (diskIsFormatted) {
                if (args.length >= 1) {
                    var fileName = args[0];
                    var tsb = _fsDD.findFile(fileName);
                    if (tsb === -1) {
                        _StdOut.putText("File could not be found.");
                    }
                    else {
                        var data = _fsDD.readFile(tsb);
                        data = _MM.hexToString(data);
                        _StdOut.putText(data);
                    }
                }
                else {
                    _StdOut.putText("Error, please supply a file name.");
                }
            }
            else {
                _StdOut.putText("Please format disk first.");
            }
        };
        Shell.prototype.shellWrite = function (args) {
            if (diskIsFormatted) {
                if (args.length >= 2) {
                    var fileName = args[0];
                    if (fileName.charAt(0) == ".") {
                        _StdOut.putText("Cannot write to swap file.");
                    }
                    else {
                        var data = "";
                        for (var i = 1; i < args.length; i++) {
                            if (i > 1) {
                                data += " " + args[i];
                            }
                            else {
                                data += args[i];
                            }
                        }
                        // remove double quotes
                        data = data.substring(1, data.length - 1);
                        var tsb = _fsDD.findFile(fileName);
                        if (tsb === -1) {
                            _StdOut.putText("File could not be found.");
                        }
                        else {
                            var success = _fsDD.writeFile(tsb, data);
                            if (success) {
                                _StdOut.putText("Successfully wrote to file \"" + fileName + "\"");
                            }
                        }
                    }
                }
                else {
                    _StdOut.putText("Error, please supply a file name and data.");
                }
            }
            else {
                _StdOut.putText("Please format disk first.");
            }
        };
        Shell.prototype.shellDelete = function (args) {
            if (args.length === 1) {
                var fileName = args[0];
                if (fileName.charAt(0) == ".") {
                    _StdOut.putText("Cannot delete files starting with \".\"");
                }
                else {
                    var tsb = _fsDD.findFile(fileName);
                    if (tsb === -1) {
                        _StdOut.putText("File could not be found.");
                    }
                    else {
                        var success = _fsDD.deleteFile(tsb, fileName);
                        if (success) {
                            _StdOut.putText("Successfully deleted file \"" + fileName + "\"");
                        }
                    }
                }
            }
            else {
                _StdOut.putText("Error deleting file, supplied parameters is wrong.");
            }
        };
        Shell.prototype.shellFormat = function () {
            if (_CPU.isExecuting === true) {
                _StdOut.putText("Cannot format disk, CPU is running.");
            }
            else {
                var result = _fsDD.format();
                if (result) {
                    _StdOut.putText("File system has been formatted.");
                    diskIsFormatted = true;
                }
                else {
                    _StdOut.putText("Error formatting file system.");
                }
            }
        };
        Shell.prototype.shellLs = function () {
            var tsb = _fsDD.getNextFreeDirTSB();
            if (tsb[0] === 0 && tsb[1] === 0 && tsb[2] === 0) {
                _StdOut.putText("No files currently on disk.");
            }
            else {
                for (var track = 0; track < _fsDD.tracks; track++) {
                    for (var sector = 0; sector < _fsDD.sectors; sector++) {
                        for (var block = 0; block < _fsDD.blocks; block++) {
                            if (track === tsb[0] && sector === tsb[1] && block === tsb[2]) {
                                return;
                            }
                            var data = sessionStorage.getItem(_fsDD.makeKey(track, sector, block));
                            data = _MM.hexToString(data);
                            _StdOut.putText(data);
                            _StdOut.advanceLine();
                        }
                    }
                }
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
