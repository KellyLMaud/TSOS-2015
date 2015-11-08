var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(size) {
            this.memorySize = size;
            this.initializeMemory(this.memorySize);
        }
        Memory.prototype.initializeMemory = function (size) {
            for (var i = 0; i < this.memory.length; i++) {
                this.memory[i] = new Array(size);
                var currentBlock = this.memory[i];
                for (var j = 0; j < size; j++) {
                    currentBlock[j] = "00";
                }
            }
        };
        //public getMemory(partition): string []{
        //    return this.memory[partition];
        //}
        Memory.prototype.getMemoryAtLocation = function (memLocation) {
            return this.memory[memLocation];
        };
        Memory.prototype.clearMemory = function () {
            this.initializeMemory(this.memorySize);
            TSOS.Control.clearMemTable(this.memory.length);
        };
        Memory.prototype.isEmpty = function () {
            for (var i = 0; i < this.memory.length; i++) {
                var currentBlock = this.memory[i];
                for (var j = 0; j < currentBlock.length; j++) {
                    if (currentBlock[j] != "00") {
                        return false;
                    }
                }
            }
            return true;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
