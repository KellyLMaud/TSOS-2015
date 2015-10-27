module TSOS {

    export class Memory {
        memory: string[];
        memorySize: number;

        constructor(size: number){
            this.memorySize = size;
            this.initializeMemory(this.memorySize);
        }

        private initializeMemory(size): void {
            this.memory = [size];
            for(var x = 0; x < size; x++){
                this.memory[x] = "00";
            }
        }

        public getMemory(): string []{
            return this.memory;
        }

        public getMemoryAtLocation(memLocation): string {
            return this.memory[memLocation];
        }

        public clearMemory(): void {
            this.initializeMemory(this.memorySize);
            //Control.emptyFullMemTable(this.memoryBlocks.length);
        }

        public isEmpty(): boolean {
            for(var x = 0; x < this.memory.length; x++){
                if(this.memory[x] != "00"){
                    return false;
                }
            }
            return true;
        }

    }
}