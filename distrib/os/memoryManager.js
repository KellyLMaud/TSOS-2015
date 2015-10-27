///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.storeProgramInMemory = function (code) {
            this.base = 0;
            this.limit = 255;
            for (var i = 0; i < code.length; i++) {
                this.writeToMemory(i, code[i]);
            }
        };
        MemoryManager.prototype.readFromMemory = function (loc) {
            return _MEM.getMemoryAtLocation(loc);
        };
        MemoryManager.prototype.writeToMemory = function (loc, code) {
            var hexCode = this.dec2Hex(code);
            var mem = _MEM.getMemory();
            if (hexCode.length < 2)
                hexCode = "0" + hexCode;
            mem[loc] = hexCode;
            TSOS.Control.updateMemTableAtLoc(Math.floor(loc / 8), loc % 8, hexCode);
        };
        MemoryManager.prototype.hex2Dec = function (hex) {
            return parseInt(hex, 16);
        };
        MemoryManager.prototype.dec2Hex = function (dec) {
            return dec.toString(16);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
