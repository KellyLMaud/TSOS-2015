module TSOS {

    export class Memory {
        memory: string[][];
        memorySize: number;

        constructor(partition: number, size: number){
            this.memorySize = size;
            this.memory = new Array(partition);
            this.initializeMemory(this.memorySize);
        }

        private initializeMemory(size): void {
            for(var i = 0; i < this.memory.length; i++){
                this.memory[i] = new Array(size);
                var currentPartition = this.memory[i];
                for(var j = 0; j < size; j++){
                    currentPartition[j] = "00";
                }
            }
        }

        public getMemoryPartition(partition): string[] {
            return this.memory[partition];

        }

        public clearMemory(): void {
            this.initializeMemory(3);
            Control.clearMemTable(_CurrPartitionOfMem);
        }

        public isEmpty(): boolean {
            for(var i = 0; i < this.memory.length; i++){
                var currentPartition = this.memory[i];
                for(var j = 0; j < currentPartition.length; j++){
                    if(currentPartition[j] != "00"){
                        return false;
                    }
                }
            }
            return true;
        }

    }
}