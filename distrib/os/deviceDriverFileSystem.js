var TSOS;
(function (TSOS) {
    var DeviceDriverFileSystem = (function () {
        function DeviceDriverFileSystem() {
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            this.numberOfBytes = 64;
            this.metaDataSize = 4;
            this.numOfDataBytes = this.numberOfBytes - this.metaDataSize;
        }
        DeviceDriverFileSystem.prototype.makeKey = function (track, sector, block) {
            return String(track) + String(sector) + String(block);
        };
        DeviceDriverFileSystem.prototype.getNextFreeDirTSB = function () {
            var nextFreeBlock;
            for (var track = 0; track < 1; track++) {
                for (var sector = 0; sector < this.sectors; sector++) {
                    for (var block = 0; block < this.blocks; block++) {
                        if (sessionStorage.getItem(this.makeKey(track, sector, block)).substr(0, 1) === "0") {
                            nextFreeBlock = [track, sector, block];
                            return nextFreeBlock;
                        }
                    }
                }
            }
            nextFreeBlock = [null, null, null];
            return nextFreeBlock;
        };
        DeviceDriverFileSystem.prototype.getNextFreeDataTSB = function () {
            var nextFreeBlock;
            for (var track = 1; track < this.tracks; track++) {
                for (var sector = 0; sector < this.sectors; sector++) {
                    for (var block = 0; block < this.blocks; block++) {
                        if (sessionStorage.getItem(this.makeKey(track, sector, block)).substr(0, 1) === "0") {
                            nextFreeBlock = [track, sector, block];
                            return nextFreeBlock;
                        }
                    }
                }
            }
        };
        DeviceDriverFileSystem.prototype.createInitialData = function () {
            var data = "";
            for (var i = 0; i < this.numberOfBytes; i++) {
                data += "0";
            }
            return data;
        };
        DeviceDriverFileSystem.prototype.createStartFile = function () {
            var startFileData = ".MasterBootRecord";
            startFileData = _MM.stringToHex(startFileData);
            var tsb = this.getNextFreeDirTSB();
            var tsbKey = this.makeKey(tsb[0], tsb[1], tsb[2]);
            for (var i = startFileData.length; i < this.numOfDataBytes; i++) {
                startFileData += "0";
            }
            startFileData = "1---" + startFileData;
            sessionStorage.setItem(tsbKey, startFileData);
            TSOS.Control.updateTSBAtLoc("fs" + tsbKey + "meta", startFileData.substr(0, 4));
            TSOS.Control.updateTSBAtLoc("fs" + tsbKey + "data", startFileData.substr(4));
        };
        // function for the create <filename> shell command
        DeviceDriverFileSystem.prototype.createFile = function (fileName) {
            fileName = _MM.stringToHex(fileName);
            var tsb = this.getNextFreeDirTSB();
            var dataTSB = this.getNextFreeDataTSB();
            var dataTSBKey = this.makeKey(dataTSB[0], dataTSB[1], dataTSB[2]);
            var tsbKey = this.makeKey(tsb[0], tsb[1], tsb[2]);
            if (fileName.length >= 60) {
                _StdOut.putText("Error - file name too long.");
                return false;
            }
            for (var i = fileName.length; i < this.numOfDataBytes; i++) {
                fileName += "0";
            }
            fileName = "1" + dataTSBKey + fileName;
            sessionStorage.setItem(tsbKey, fileName);
            TSOS.Control.updateTSBAtLoc("fs" + tsbKey + "meta", fileName.substr(0, 4));
            TSOS.Control.updateTSBAtLoc("fs" + tsbKey + "data", fileName.substr(4));
            var initialData = this.createInitialData();
            initialData = "1---" + initialData.substr(4);
            sessionStorage.setItem(dataTSBKey, initialData);
            TSOS.Control.updateTSBAtLoc("fs" + dataTSBKey + "meta", initialData.substr(0, 4));
            TSOS.Control.updateTSBAtLoc("fs" + dataTSBKey + "data", initialData.substr(4));
            return true;
        };
        DeviceDriverFileSystem.prototype.findFile = function (fileName) {
            fileName = _MM.stringToHex(fileName);
            for (var sector = 0; sector < this.sectors; sector++) {
                for (var block = 0; block < this.blocks; block++) {
                    var data = sessionStorage.getItem(this.makeKey(0, sector, block));
                    if (data.substr(4, fileName.length) == fileName && parseInt(data.substr(fileName.length + 4, data.length)) === 0) {
                        return data.substr(0, 4);
                    }
                }
            }
            return -1;
        };
        DeviceDriverFileSystem.prototype.findFileDir = function (fileName) {
            fileName = _MM.stringToHex(fileName);
            for (var sector = 0; sector < this.sectors; sector++) {
                for (var block = 0; block < this.blocks; block++) {
                    var data = sessionStorage.getItem(this.makeKey(0, sector, block));
                    if (data.substr(4, fileName.length) == fileName && parseInt(data.substr(fileName.length + 4, data.length)) === 0) {
                        return "0" + "" + sector + "" + block;
                    }
                }
            }
            return "-1";
        };
        DeviceDriverFileSystem.prototype.writeFile = function (startingTSB, data) {
            data = _MM.stringToHex(data);
            var numOfRows = Math.floor(data.length / this.numOfDataBytes);
            if (numOfRows === 0) {
                for (var i = data.length; i < this.numOfDataBytes; i++) {
                    data += "0";
                }
                data = "1---" + data;
                sessionStorage.setItem(startingTSB.substr(1), data);
                TSOS.Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "meta", data.substr(0, 4));
                TSOS.Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "data", data.substr(4));
            }
            else {
                for (var x = 0; x <= numOfRows; x++) {
                    var nextFreeTSB = this.getNextFreeDataTSB();
                    var nextFreeTSBKey = this.makeKey(nextFreeTSB[0], nextFreeTSB[1], nextFreeTSB[2]);
                    if (x === 0) {
                        sessionStorage.setItem(startingTSB.substr(1), "1" + nextFreeTSBKey + data.substr(x * this.numOfDataBytes, this.numOfDataBytes));
                        TSOS.Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "meta", "1" + nextFreeTSBKey);
                        TSOS.Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "data", data.substr(i * this.numOfDataBytes, this.numOfDataBytes));
                    }
                    else {
                        if (x == numOfRows) {
                            var lastRowOfData = data.substr(x * this.numOfDataBytes);
                            for (var i = lastRowOfData.length; i < this.numOfDataBytes; i++) {
                                lastRowOfData += "0";
                            }
                            lastRowOfData = "1---" + lastRowOfData;
                            sessionStorage.setItem(nextFreeTSBKey, lastRowOfData);
                            TSOS.Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "meta", lastRowOfData.substr(0, 4));
                            TSOS.Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "data", lastRowOfData.substr(4));
                        }
                        else {
                            var nextFreeTSBPlusOne;
                            if (nextFreeTSB[1] === 7 && nextFreeTSB[2] === 7) {
                                nextFreeTSBPlusOne = [nextFreeTSB[0] + 1, 0, 0];
                            }
                            else if (nextFreeTSB[2] === 7) {
                                nextFreeTSBPlusOne = [nextFreeTSB[0], nextFreeTSB[1] + 1, 0];
                            }
                            else {
                                nextFreeTSBPlusOne = [nextFreeTSB[0], nextFreeTSB[1], nextFreeTSB[2] + 1];
                            }
                            var nextFreeTSBPlusOneKey = this.makeKey(nextFreeTSBPlusOne[0], nextFreeTSBPlusOne[1], nextFreeTSBPlusOne[2]);
                            sessionStorage.setItem(nextFreeTSBKey, "1" + nextFreeTSBPlusOneKey + data.substr(x * this.numOfDataBytes, this.numOfDataBytes));
                            TSOS.Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "meta", "1" + nextFreeTSBPlusOneKey);
                            TSOS.Control.updateTSBAtLoc("fs" + nextFreeTSBKey + "data", data.substr(i * this.numOfDataBytes, this.numOfDataBytes));
                        }
                    }
                }
            }
            return true;
        };
        DeviceDriverFileSystem.prototype.readFile = function (startingTSB) {
            var nextTSB = sessionStorage.getItem(startingTSB.substr(1)).substr(1, 3);
            var data = sessionStorage.getItem(startingTSB.substr(1)).substr(4);
            while (nextTSB != "---") {
                data += sessionStorage.getItem(nextTSB).substr(4);
                nextTSB = sessionStorage.getItem(nextTSB).substr(1, 3);
            }
            return data;
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (startingTSB, fileName) {
            var initialData = this.createInitialData();
            var nextTSB = sessionStorage.getItem(startingTSB.substr(1)).substr(1, 3);
            if (nextTSB != "---") {
                var nextNextTSB = sessionStorage.getItem(nextTSB).substr(1, 3);
            }
            var dirTSB = this.findFileDir(fileName);
            sessionStorage.setItem(dirTSB, initialData);
            TSOS.Control.updateTSBAtLoc("fs" + dirTSB + "meta", initialData.substr(0, 4));
            TSOS.Control.updateTSBAtLoc("fs" + dirTSB + "data", initialData.substr(4));
            while (nextTSB != "---") {
                sessionStorage.setItem(nextTSB, initialData);
                TSOS.Control.updateTSBAtLoc("fs" + nextTSB + "meta", initialData.substr(0, 4));
                TSOS.Control.updateTSBAtLoc("fs" + nextTSB + "data", initialData.substr(4));
                nextTSB = nextNextTSB;
                if (nextTSB == "---") {
                    break;
                }
                nextNextTSB = sessionStorage.getItem(nextTSB).substr(1, 3);
            }
            sessionStorage.setItem(startingTSB.substr(1), initialData);
            TSOS.Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "meta", initialData.substr(0, 4));
            TSOS.Control.updateTSBAtLoc("fs" + startingTSB.substr(1) + "data", initialData.substr(4));
            return true;
        };
        DeviceDriverFileSystem.prototype.format = function () {
            var initialData = this.createInitialData();
            for (var track = 0; track < this.tracks; track++) {
                for (var sector = 0; sector < this.sectors; sector++) {
                    for (var block = 0; block < this.blocks; block++) {
                        sessionStorage.setItem(this.makeKey(track, sector, block), initialData);
                    }
                }
            }
            this.initializeFileSystem();
            this.createStartFile();
            return true;
        };
        DeviceDriverFileSystem.prototype.initializeFileSystem = function () {
            _FileTable = document.getElementById("fileSystem");
            var tbody = document.createElement("tbody");
            var data, metaData, tr, td, td1, td2;
            for (var track = 0; track < this.tracks; track++) {
                for (var sector = 0; sector < this.sectors; sector++) {
                    for (var block = 0; block < this.blocks; block++) {
                        metaData = "0000"; //this.createInitialData().substr(0, 4);
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
        };
        return DeviceDriverFileSystem;
    })();
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
