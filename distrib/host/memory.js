var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(size) {
            this.memorySize = size;
            this.initializeMemory(this.memorySize);
        }
        Memory.prototype.initializeMemory = function (size) {
            this.memory = [size];
            for (var x = 0; x < size; x++) {
                this.memory[x] = "00";
            }
        };
        Memory.prototype.getMemory = function () {
            return this.memory;
        };
        Memory.prototype.getMemoryAtLocation = function (memLocation) {
            return this.memory[memLocation];
        };
        Memory.prototype.clearMemory = function () {
            this.initializeMemory(this.memorySize);
            //Control.emptyFullMemTable(this.memoryBlocks.length);
        };
        Memory.prototype.isEmpty = function () {
            for (var x = 0; x < this.memory.length; x++) {
                if (this.memory[x] != "00") {
                    return false;
                }
            }
            return true;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
