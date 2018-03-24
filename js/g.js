//数据结构
class Grid {
    constructor(sideLength) {
        //属性
        this.sideLength = sideLength; //棋盘边长
        this.blockSum = sideLength * sideLength; //棋盘总格数
        this.block = [...Array(this.blockSum)]; //定义block[i] 为第i格棋盘
        this.isEmpty = true;
        //方法
        //初始化
        if (typeof this.Start !== "function") {
            Grid.prototype.Start = function () {
                let block = this.block;
                let blockNum;
                for (blockNum = 0; blockNum < this.blockSum; blockNum++){
                    block[blockNum] = {
                        color: 0,
                        gridLink: [],
                        isFilled: false,
                        position: {x: blockNum % sideLength,y: parseInt(blockNum / sideLength,10)}
                    };
                }
                this.InitBlockLink();
            };
        }
        //初始化棋盘连接关系
        if (typeof this.InitBlockLink !== "function") {
            Grid.prototype.InitBlockLink = function () {
                let i,j;
                for (i = 0; i < sideLength; i++) {
                    for (j = 0; j < sideLength; j++) {
                        if ((i - 1) >= 0) this.block[i * sideLength + j].gridLink.push((i - 1) * sideLength + j);
                        if ((j - 1) >= 0) this.block[i * sideLength + j].gridLink.push(i * sideLength + j - 1);
                        if ((i + 1) < sideLength) this.block[i * sideLength + j].gridLink.push((i + 1) * sideLength + j);
                        if ((j + 1) < sideLength) this.block[i * sideLength + j].gridLink.push(i * sideLength + j + 1);
                        this.block[i * sideLength + j].gridLink.sort(ASC);
                    }
                }
                function ASC() {
                    return function (a,b) {
                        return a - b;
                    };
                }
            };
        }
        //棋盘是否满了
        if (typeof this.IsEmpty !== "function") {
            Grid.prototype.IsEmpty = function () {
                let i;
                for (i = 0; i < this.blockSum; i++) {
                    if (this.block[i].isFilled == false) {
                        this.isEmpty = true;
                        break;
                    }
                }
                if (i == this.blockSum) this.isEmpty = false;
            };
        }
        //是否能到达那个点
        if (typeof this.Arrive !== "function") {
            Grid.prototype.Arrive = function (blockNum1,blockNum2) {
                let temp = this.BFS(blockNum1,blockNum2);
                if (temp.length === 0) return false;
                else return true;
            };
        }
        //添加棋子
        if (typeof this.AddPiece !== "function") {
            Grid.prototype.AddPiece = function (blockNum) {
                this.block[blockNum].isFilled = true;
                this.IsEmpty();
                var temp = this.block[blockNum].gridLink;
                for (var i = 0; i < temp.length; i++) {
                    var currentSquare = this.block[temp[i]].gridLink;
                    for (var j = 0; j < currentSquare.length; j++) {
                        if (currentSquare[j] == blockNum) currentSquare.splice(j,1);
                    }
                }
                this.block[blockNum].gridLink = [];
            };
        }
        //删除棋子
        if (typeof this.DeletePiece !== "function") {
            Grid.prototype.DeletePiece = function (blockNum) {
                function ASC(a,b) {
                    return a - b;
                } //sort()方法进行升序排序使用的内部函数
                this.block[blockNum].isFilled = false;
                var temp = this.block[blockNum].gridLink;
                if (this.block[blockNum].position.x-1>=0) temp.push(blockNum - 1);
                if (this.block[blockNum].position.x+1<this.sideLength) temp.push(blockNum + 1);
                if (this.block[blockNum].position.y-1>=0) temp.push(blockNum - this.sideLength);
                if (this.block[blockNum].position.y+1<this.sideLength) temp.push(blockNum + this.sideLength);
                temp.sort(ASC);
                for (var i = 0; i < temp.length; i++) {
                    this.block[temp[i]].gridLink.push(blockNum);
                    this.block[temp[i]].gridLink.sort(ASC);
                }
            };
        }
        //广度搜索
        if (typeof this.BFS !== "function") {
            Grid.prototype.BFS = function (blockNum1,blockNum2) {
                var tempQ = [];
                var currentSquareLinks;
                var visited = [];
                var pathRecord = []; //记录路径
                var isEnd = false; //是否寻找到目标点
                var i;
                for (i = 0; i < this.blockSum; i++) {
                    visited[i] = false;
                    pathRecord[i] = -1;
                } //访问初始化
                visited[blockNum1] = true;
                tempQ.push(blockNum1);
                while (!isEnd) {
                    //确定首元素链接列表
                    if(typeof (this.block[tempQ[0]]) !=="undefined" && tempQ[0].length !==0) currentSquareLinks = this.block[tempQ[0]].gridLink;
                    else { 
                        console.log("can't get there");
                        break; 
                    }
                    for (i = 0; i < currentSquareLinks.length; i++) {
                        if (visited[currentSquareLinks[i]] == false) {
                            if (currentSquareLinks[i] == blockNum2) {
                                isEnd = true;
                                visited[currentSquareLinks[i]] = true;
                                pathRecord[currentSquareLinks[i]] = tempQ[0];
                            } else {
                                tempQ.push(currentSquareLinks[i]);
                                pathRecord[currentSquareLinks[i]] = tempQ[0];
                                visited[currentSquareLinks[i]] = true;
                            }
                        }
                    } //将链接列表加入TempQ
                    tempQ.shift(); //将tempQ首元素出列
                }
                //打印路径
                if (isEnd) {
                    i = blockNum2;
                    let arr = [];
                    while (pathRecord[i] != -1) {
                        arr.unshift(pathRecord[i]);
                        i = pathRecord[i];
                    }
                    arr.push(blockNum2);
                    console.log(arr);
                    return arr;
                } else {
                    return [];
                }
            };
        }
    }
}