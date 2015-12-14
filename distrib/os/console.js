///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.enteredCommands = [];
            this.curPosition = 0;
            this.currentLineNumber = 0;
            this.currentBufferLine = "";
            this.added = false;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            var possibleCommands = [];
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(9)) {
                    for (var i in _OsShell.commandList) {
                        if (_OsShell.commandList[i].command.search(this.buffer) == 0) {
                            possibleCommands[possibleCommands.length] = _OsShell.commandList[i].command;
                        }
                    }
                    if (possibleCommands.length == 1) {
                        var c = 0;
                        while (c < this.buffer.length) {
                            console.log(this.buffer.length);
                            this.backspace();
                        }
                        this.buffer = possibleCommands[0];
                        //backspace needed here to clear what was already input
                        _StdOut.putText(this.buffer);
                    }
                    else if (possibleCommands.length > 1) {
                        for (var i in possibleCommands) {
                            _StdOut.advanceLine();
                            _StdOut.putText(possibleCommands[i]);
                        }
                        _StdOut.advanceLine();
                        _OsShell.putPrompt();
                        _StdOut.putText(this.buffer);
                    }
                }
                else if (chr === String.fromCharCode(380)) {
                    if (this.curPosition > 0) {
                        this.curPosition--;
                        var a = 0;
                        while (a < this.buffer.length) {
                            console.log(this.buffer.length);
                            this.backspace();
                        }
                        this.buffer = this.enteredCommands[this.curPosition];
                        _StdOut.putText(this.buffer);
                    }
                }
                else if (chr === String.fromCharCode(400)) {
                    if (this.curPosition < this.enteredCommands.length) {
                        this.curPosition++;
                        var b = 0;
                        while (b < this.buffer.length) {
                            console.log(this.buffer.length);
                            this.backspace();
                        }
                        this.buffer = this.enteredCommands[this.curPosition];
                        _StdOut.putText(this.buffer);
                    }
                }
                else if (chr === String.fromCharCode(8)) {
                    this.backspace();
                }
                else if (chr === String.fromCharCode(13)) {
                    //add the entered command into an array for command history recall
                    this.enteredCommands[this.enteredCommands.length] = this.buffer;
                    this.curPosition = this.enteredCommands.length;
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    // line wrap
                    if (this.currentLineNumber == 0 && !this.added) {
                        this.currentBufferLine += _OsShell.promptStr;
                        this.added = true;
                    }
                    if (TSOS.CanvasTextFunctions.measure(_DefaultFontFamily, _DefaultFontSize, this.currentBufferLine) < _Canvas.width) {
                        this.putText(chr);
                    }
                    else {
                        this.currentBufferLine = "";
                        _StdOut.advanceLine();
                        this.currentLineNumber++;
                        this.putText(chr);
                    }
                    // ... and add it to our buffer.
                    this.buffer += chr;
                    this.currentBufferLine += chr;
                }
            }
        };
        Console.prototype.backspace = function () {
            var buffer = _Console.buffer;
            var curXPos = _Console.currentXPosition;
            var backspacedBuffer = "";
            var charWidth = TSOS.CanvasTextFunctions.measure(_DefaultFontFamily, _DefaultFontSize, buffer[buffer.length - 1]);
            for (var x = 0; x < buffer.length - 1; x++) {
                backspacedBuffer += buffer[x];
            }
            _Console.buffer = backspacedBuffer;
            _Console.currentXPosition = curXPos - charWidth;
            _DrawingContext.fillStyle = "#4d4d4d";
            _DrawingContext.fillRect(_Console.currentXPosition, _Console.currentYPosition - _DefaultFontSize - 2, charWidth, _DefaultFontSize + _FontHeightMargin + 2);
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                _DrawingContext.strokeStyle = "#00b7ff";
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition >= _Canvas.height) {
                var offset = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
                var img = _DrawingContext.getImageData(0, offset, _Canvas.width, _Canvas.height);
                _DrawingContext.putImageData(img, 0, 0);
                this.currentYPosition = _Canvas.height - this.currentFontSize;
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
