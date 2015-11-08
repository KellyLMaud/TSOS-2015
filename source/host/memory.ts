module TSOS {

    export class Memory {
        memory: string[][];
        memorySize: number;

        constructor(size: number){
            this.memorySize = size;
            this.initializeMemory(this.memorySize);
        }

        private initializeMemory(size): void {
            for(var i = 0; i < this.memory.length; i++){
                this.memory[i] = new Array(size);
                var currentBlock = this.memory[i];
                for(var j = 0; j < size; j++){
                    currentBlock[j] = "00";
                }
            }
        }

        //public getMemory(partition): string []{
        //    return this.memory[partition];
        //}

        public getMemoryAtLocation(memLocation): string[] {
            return this.memory[memLocation];
        }

        public clearMemory(): void {
            this.initializeMemory(this.memorySize);
            Control.clearMemTable(this.memory.length);
        }

        public isEmpty(): boolean {
            for(var i = 0; i < this.memory.length; i++){
                var currentBlock = this.memory[i];
                for(var j = 0; j < currentBlock.length; j++){
                    if(currentBlock[j] != "00"){
                        return false;
                    }
                }
            }
            return true;
        }

    }
}