var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(partition, size) {
            this.memorySize = size;
            this.memory = new Array(partition);
            this.initializeMemory(this.memorySize);
        }
        Memory.prototype.initializeMemory = function (size) {
            for (var i = 0; i < this.memory.length; i++) {
                this.memory[i] = new Array(size);
                var currentPartition = this.memory[i];
                for (var j = 0; j < size; j++) {
                    currentPartition[j] = "00";
                }
            }
        };
        //public getMemory(partition): string []{
        //    return this.memory[partition];
        //}
        Memory.prototype.getMemoryPartition = function (memLocation) {
            return this.memory[memLocation];
        };
        Memory.prototype.clearMemory = function () {
            this.initializeMemory(this.memorySize);
            TSOS.Control.clearMemTable(this.memory.length);
        };
        Memory.prototype.isEmpty = function () {
            for (var i = 0; i < this.memory.length; i++) {
                var currentPartition = this.memory[i];
                for (var j = 0; j < currentPartition.length; j++) {
                    if (currentPartition[j] != "00") {
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
