///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.storeProgramInMemory = function (partition, code) {
            if (partition == 0) {
                this.base = 0;
                this.limit = 255;
            }
            else if (partition == 1) {
                this.base = 256;
                this.limit = 511;
            }
            else if (partition == 2) {
                this.base = 512;
                this.limit = 1023;
            }
            for (var i = 0; i < code.length; i++) {
                this.writeToMemory(partition, i, code[i]);
            }
        };
        MemoryManager.prototype.readFromMemory = function (partition, loc) {
            var memPartition = _MEM.getMemoryPartition(partition);
            return memPartition[loc];
        };
        MemoryManager.prototype.writeToMemory = function (partition, loc, code) {
            var row = partition * 32;
            var hexCode = this.dec2Hex(code);
            var memPartition = _MEM.getMemoryPartition(partition);
            if (hexCode.length < 2)
                hexCode = "0" + hexCode;
            memPartition[loc] = hexCode;
            TSOS.Control.updateMemTableAtLoc(Math.floor(loc / 8) + row, loc % 8, hexCode);
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
