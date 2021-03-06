module TSOS {

    export class DeviceDriverFileSystem {

        public tracks = 4;
        public sectors = 8;
        public blocks = 8;
        public numberOfBytes = 64;
        public metaDataSize = 4;
        public numOfDataBytes = this.numberOfBytes - this.metaDataSize;

        constructor(){

        }

        public makeKey(track, sector, block): string {
            return String(track) + String(sector) + String(block);
        }

        public getNextFreeDirTSB(): any[] {
            var nextFreeBlock;

            for(var track = 0; track < 1; track++){
                for(var sector = 0; sector < this.sectors; sector++){
                    for(var block = 0; block < this.blocks; block++){
                        if(sessionStorage.getItem(this.makeKey(track, sector, block)).substr(0, 1) === "0"){
                            nextFreeBlock = [track, sector, block];
                            return nextFreeBlock;
                        }
                    }
                }
            }

            nextFreeBlock = [null, null, null];
            return nextFreeBlock;
        }

        public getNextFreeDataTSB(): any[] {
            var nextFreeBlock;

            for(var track = 1; track < this.tracks; track++){
                for(var sector = 0; sector < this.sectors; sector++){
                    for(var block = 0; block < this.blocks; block++){
                        if(sessionStorage.getItem(this.makeKey(track, sector, block)).substr(0, 1) === "0"){
                            nextFreeBlock = [track, sector, block];
                            return nextFreeBlock;
                        }
                    }
                }
            }
        }

        public createInitialData(): string {
            var data = "";
            for(var i = 0; i < this.numberOfBytes; i++){
                data += "0";
            }
            return data;
        }

        public createStartFile(): void {
            var startFileData = ".MasterBootRecord";
            startFileData = _MM.stringToHex(startFileData);
            var tsb = this.getNextFreeDirTSB();
            var tsbKey = this.makeKey(tsb[0], tsb[1], tsb[2]);

            for(var i = startFileData.length; i < this.numOfDataBytes; i++){
                startFileData += "0";
            }

            startFileData = "1---" + startFileData;

            sessionStorage.setItem(tsbKey, startFileData);
            Control.updateTSBAtLoc("fs" + tsbKey + "meta", startFileData.substr(0, 4));
            Control.updateTSBAtLoc("fs" + tsbKey + "data", startFileData.substr(4));

        }

        // function for the create <filename> shell command
        public createFile(fileName): boolean {
            fileName = _MM.stringToHex(fileName);
            var tsb = this.getNextFreeDirTSB();
            var dataTSB = this.getNextFreeDataTSB();
            var dataTSBKey = this.makeKey(dataTSB[0], dataTSB[1], dataTSB[2]);
            var tsbKey = this.makeKey(tsb[0], tsb[1], tsb[2]);

            if(fileName.length >= 60){
                _StdOut.putText("Error - file name too long.");
                return false;
            }

            for(var i = fileName.length; i < this.numOfDataBytes; i++){
                fileName += "0";
            }

            fileName = "1" + dataTSBKey + fileName;

            sessionStorage.setItem(tsbKey, fileName);
            Control.updateTSBAtLoc("fs" + tsbKey + "meta", fileName.substr(0, 4));
            Control.updateTSBAtLoc("fs" + tsbKey + "data", fileName.substr(4));

            var initialData = this.createInitialData();
            initialData = "1---" + initialData.substr(4);

            sessionStorage.setItem(dataTSBKey, initialData);
            Control.updateTSBAtLoc("fs" + dataTSBKey + "meta", initialData.substr(0, 4));
            Control.updateTSBAtLoc("fs" + dataTSBKey + "data", initialData.substr(4));

            return true;
        }

        public findFile(fileName){
            fileName = _MM.stringToHex(fileName);

            for(var sector = 0; sector < this.sectors; sector++){
                for(var block = 0; block < this.blocks; block++){
                    var data = sessionStorage.getItem(this.makeKey(0, sector, block));

                    if(data.substr(4, fileName.length) == fileName && parseInt(data.substr(fileName.length+4, data.length)) === 0){
                        return data.substr(0,4);
                    }
                }
            }
            return -1;
        }

        public findFileDir(fileName){
            fileName = _MM.stringToHex(fileName);

            for(var sector = 0; sector < this.sectors; sector++){
                for(var block = 0; block < this.blocks; block++){
                    var data = sessionStorage.getItem(this.makeKey(0, sector, block));

                    if(data.substr(4, fileName.length) == fileName && parseInt(data.substr(fileName.length+4, data.length)) === 0){
                        return "0" + "" + sector + "" + block;
                    }
                }
            }
            return "-1";

        }

        public writeFile(startingTSB, data): boolean {
            data = _MM.stringToHex(data);
            var numOfRows = Math.floor(data.length/this.numOfDataBytes);

            if(numOfRows === 0){
                for(var i = data.length; i < this.numOfDataBytes; i++){
                    data += "0";
                }
                data = "1---" + data;

                sessionStorage.setItem(startingTSB.substr(1), data);
                Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "meta", data.substr(0, 4));
                Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "data", data.substr(4));
            } else {
                for(var x = 0; x <= numOfRows; x++){
                    var nextFreeTSB = this.getNextFreeDataTSB();
                    var nextFreeTSBKey = this.makeKey(nextFreeTSB[0], nextFreeTSB[1], nextFreeTSB[2]);

                    if(x === 0){
                        sessionStorage.setItem(startingTSB.substr(1), "1" + nextFreeTSBKey + data.substr(x*this.numOfDataBytes, this.numOfDataBytes));
                        Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "meta", "1" + nextFreeTSBKey);
                        Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "data", data.substr(i*this.numOfDataBytes, this.numOfDataBytes));
                    } else {
                        if(x == numOfRows){
                            var lastRowOfData = data.substr(x*this.numOfDataBytes);
                            for(var i = lastRowOfData.length; i < this.numOfDataBytes; i++){
                                lastRowOfData += "0";
                            }
                            lastRowOfData = "1---" + lastRowOfData;
                            sessionStorage.setItem(nextFreeTSBKey, lastRowOfData);
                            Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "meta", lastRowOfData.substr(0, 4));
                            Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "data", lastRowOfData.substr(4));
                        } else {
                            var nextFreeTSBPlusOne;

                            if(nextFreeTSB[1] === 7 && nextFreeTSB[2] === 7){
                                nextFreeTSBPlusOne = [nextFreeTSB[0]+1, 0, 0];
                            } else if(nextFreeTSB[2] === 7){
                                nextFreeTSBPlusOne = [nextFreeTSB[0], nextFreeTSB[1]+1, 0];
                            } else {
                                nextFreeTSBPlusOne = [nextFreeTSB[0], nextFreeTSB[1], nextFreeTSB[2]+1];
                            }

                            var nextFreeTSBPlusOneKey = this.makeKey(nextFreeTSBPlusOne[0], nextFreeTSBPlusOne[1], nextFreeTSBPlusOne[2]);
                            sessionStorage.setItem(nextFreeTSBKey, "1" + nextFreeTSBPlusOneKey + data.substr(x*this.numOfDataBytes, this.numOfDataBytes));
                            Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "meta", "1" + nextFreeTSBPlusOneKey);
                            Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "data", data.substr(i*this.numOfDataBytes, this.numOfDataBytes));
                        }
                    }
                }
            }
            return true;
        }

        public readFile(startingTSB): string {
            var nextTSB = sessionStorage.getItem(startingTSB.substr(1)).substr(1,3);
            var data = sessionStorage.getItem(startingTSB.substr(1)).substr(4);

            while(nextTSB != "---"){
                data += sessionStorage.getItem(nextTSB).substr(4);
                nextTSB = sessionStorage.getItem(nextTSB).substr(1,3);
            }
            return data;
        }

        public deleteFile(startingTSB, fileName): boolean {
            var initialData = this.createInitialData();
            var nextTSB = sessionStorage.getItem(startingTSB.substr(1)).substr(1,3);

            if(nextTSB != "---"){
                var nextNextTSB = sessionStorage.getItem(nextTSB).substr(1,3);
            }
            var dirTSB = this.findFileDir(fileName);

            sessionStorage.setItem(dirTSB, initialData);
            Control.updateTSBAtLoc("fs" + dirTSB + "meta", initialData.substr(0, 4));
            Control.updateTSBAtLoc("fs" + dirTSB + "data", initialData.substr(4));

            while(nextTSB != "---"){
                sessionStorage.setItem(nextTSB, initialData);
                Control.updateTSBAtLoc("fs" + nextTSB + "meta", initialData.substr(0, 4));
                Control.updateTSBAtLoc("fs" + nextTSB + "data", initialData.substr(4));
                nextTSB = nextNextTSB;
                if(nextTSB == "---"){
                    break;
                }
                nextNextTSB = sessionStorage.getItem(nextTSB).substr(1,3);
            }

            sessionStorage.setItem(startingTSB.substr(1), initialData);
            Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "meta", initialData.substr(0, 4));
            Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "data", initialData.substr(4));

            return true;
        }

        public format(): boolean {
            var initialData = this.createInitialData();

            for(var track = 0; track < this.tracks; track++){
                for(var sector = 0; sector < this.sectors; sector++){
                    for(var block = 0; block < this.blocks; block++){
                        sessionStorage.setItem(this.makeKey(track, sector, block), initialData);
                    }
                }
            }

            this.initializeFileSystem();
            this.createStartFile();
            return true;
        }

        public initializeFileSystem(): void {
            _FileTable = <HTMLTableElement>document.getElementById("fileSystem");
            var tbody = document.createElement("tbody");
            var data, metaData, tr, td, td1, td2;

            for (var track = 0; track < this.tracks; track++) {//4 tracks
                for (var sector = 0; sector < this.sectors; sector++) {//8 sectors
                    for (var block = 0; block < this.blocks; block++) {//8 blocks

                        metaData = "0000";//this.createInitialData().substr(0, 4);
                        data = this.createInitialData().substr(4);

                        tr = document.createElement("tr");
                        tr.id = "fs" + this.makeKey(track, sector, block);

                        td = document.createElement("td");
                        td.id = "fs" + this.makeKey(track, sector, block) + "tsb";
                        td.innerHTML = this.makeKey(track, sector, block);
                        tr.appendChild(td);

                        td1 = document.createElement("td");
                        td1.id = "fs" + this.makeKey(track, sector, block) + "meta";
                        td1.innerHTML = metaData;
                        tr.appendChild(td1);

                        td2 = document.createElement("td");
                        td2.id = "fs" + this.makeKey(track, sector, block) + "data";
                        td2.innerHTML = data;
                        tr.appendChild(td2);

                        tbody.appendChild(tr);
                    }
                }
            }
            _FileTable.appendChild(tbody);
        }

        public swap(){
            var tsb, programData;
            _CurrPartitionOfMem = 0;
            _CurrentPCB.baseRegister = 0;
            _CurrentPCB.limitRegister = 255;

            programData = _MEM.getMemoryPartition(_CurrPartitionOfMem).toString().replace(/,/g, " ");

            for(var i = 0; i < _ResidentList.length; i++){
                if(_ResidentList[i].baseRegister === 0){
                    var pidAtFirstLocation = _ResidentList[i].PID;
                    _ResidentList[i].location = "On Disk";
                }
            }

            _CurrentPCB.location = "In Memory";
            var dataToBeInserted = _fsDD.readFile(_fsDD.findFile(".swap" + _CurrentPCB.PID));
            dataToBeInserted = dataToBeInserted.replace(/0+$/, '');
            dataToBeInserted = _MM.hexToString(dataToBeInserted);
            dataToBeInserted = dataToBeInserted.substring(0, dataToBeInserted.length - 1);
            dataToBeInserted += "00";

            var swap = [];

            for (var i = 0, charsLength = dataToBeInserted.length; i < charsLength; i += 2) {
                swap.push(dataToBeInserted.substring(i, i + 2));
            }

            _MM.storeProgramInMemory(_CurrPartitionOfMem, swap);

            tsb = _fsDD.findFile(".swap" + _CurrentPCB.PID);
            _fsDD.deleteFile(tsb, ".swap" + _CurrentPCB.PID);

            if(pidAtFirstLocation !== "undefined"){
                _fsDD.createFile(".swap" + pidAtFirstLocation);
                tsb = _fsDD.findFile(".swap" + pidAtFirstLocation);
                _fsDD.writeFile(tsb, programData);
            }

        }
    }
}