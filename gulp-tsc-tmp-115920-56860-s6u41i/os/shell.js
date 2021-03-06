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
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- tests the blue screen of death");
            this.commandList[this.commandList.length] = sc;
            // run <string>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<string> - runs the program with the pid specified");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
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
            var code = document.getElementById("taProgramInput").value.toUpperCase();
            var isValid = true;
            if (code.length > 0) {
                for (var i = 0; i < code.length; i++) {
                    var c = code[i];
                    if (c != 'A' && c != 'B' && c != 'C' && c != 'D' && c != 'E' && c != 'F' && c != ' ' && c != '1' && c != '2' && c != '3' && c != '4' && c != '5' && c != '6' && c != '7' && c != '8' && c != '9' && c != '0') {
                        isValid = false;
                    }
                }
                if (isValid) {
                    var curCode = code.replace(/\n/g, " ").split(" ");
                    _MEM.memory = curCode;
                    _StdOut.putText("Program successfully loaded");
                    _currentPCB = new TSOS.PCB();
                    _StdOut.advanceLine();
                    _StdOut.putText("PID: " + _currentPCB.pid); //_MM.loadProgram(curCode)); //assign a process ID & return it to the console.
                    _StdOut.advanceLine();
                    //_CPU.clearProgram();
                    _MM.storeProgramInMemory(curCode);
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
            var status = document.getElementById("taStatusBar");
            var date = new Date();
            var datetime = date.toLocaleDateString() + " " + date.toLocaleTimeString();
            status.value = datetime + " -" + newstatus + "\n" + status.value + "\n";
        };
        Shell.prototype.shellBSOD = function (args) {
            _Kernel.krnTrapError("error");
        };
        Shell.prototype.shellRun = function (args) {
            //_StdOut.putText("args = " + args);
            //_StdOut.putText("pid = " + _currentPCB.pid);
            //TODO - run the program already in memory
            if (args.length <= 0)
                _StdOut.putText("A process ID is required.");
            else if (args != _currentPCB.pid) {
                //check for valid id
                _StdOut.putText("Invalid process ID");
            }
            else {
                //run program
                _ExecutingProgram = parseInt(args[0]);
                if (_ExecutingProgram.PC !== _ExecutingProgram.base)
                    _StdOut.putText("Program already executed.");
                else
                    //_StdOut.putText("hi");
                    _CPU.isExecuting = true; //_KernelInterruptQueue.enqueue(new Interrupt(2));
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
