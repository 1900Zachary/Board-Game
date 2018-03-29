(function(factory){
    factory((this.GRID={}));
}(((exports) => { //封装，新建GRID模块，包含Renderer,Board,Piece,boardData类
    class Renderer{//-Renderer类，渲染
        constructor(width,height){
            this.domElement = document.createElement("canvas");
            this.board = new Board(0);
            this.setSize(width,height);
            if (this.domElement.getContext) this.context = this.domElement.getContext("2d");
        }

        add(object){
            if (object.constructor.name === "Board") {
                this.board = object;
                this.board.setSize(this.width,this.height);
                object.context = this.context;
            }
        }

        setSize(width,height){
            this.width = width;
            this.height = height;
            this.domElement.width = width;
            this.domElement.height = height;
            this.board.setSize(this.width,this.height);
        }

        render(board){
            this.clearCanvas();
            this.add(board);
            this.board.draw();
        }

        clearCanvas(){
            this.context.clearRect(0,0,this.width,this.height)
        }
    }

    class Board{//-Board类,棋盘
        constructor(side){
            this.side = side;
            this.context = null;
            this.piece = new Array(side*side);
            this.data = new boardData(this.side);
            this.color = [];
            this.tempColor = [];
        }

        setColor(){
            for(let i = 0;i<arguments.length;i++){
                this.color[i] = arguments[i];
            }
        }

        setSize(width,height){
            this.width = width;
            this.height = height;
        }
        
        addPiece(n){
            let i;
            let tempNum;
            for (i = 0; i<n; i++){
                tempNum = this.data.randomNum();
                this.piece[tempNum] = new Piece(tempNum,this.tempColor[i]);
                this.data.addPiece(tempNum); //更新data
                this.initPiecePosition(this.piece[tempNum]); //初始化棋子相对画布坐标
            }
        }

        randomColor(n){
            let i;
            let temp;
            this.tempColor = new Array(n);
            for (i = 0; i<n; i++){
                temp = parseInt(Math.random()*this.color.length,10);
                this.tempColor[i] = this.color[temp];
            }
        }

        initPiecePosition(piece){
            let squareLength = this.width / this.side ;
            piece.position.set(this.data.square[piece.num].position.x*squareLength+squareLength/2,this.data.square[piece.num].position.y*squareLength+squareLength/2);
        }

        draw(){
            this.context.fillStyle = "#dddddd";
            this.context.fillRect(0,0,this.width,this.height);
        }
    }

    class Piece{//-Board类,棋子
        constructor(num,color){
            this.color = color;
            this.position = {x: 0,y: 0};
            this.position.set = function(x,y){
                this.x = x;
                this.y = y;
            }
            this.num = num;
        }
    }

    class boardData{//-boardData类,棋盘数据
        constructor(side){
            this.side = side;
            this.squareSum = this.side * this.side;
            this.square = [...Array(this.squareSum)]; //定义square[i] 为第i格棋盘
            this.start();
        }

        start(){
            let side = this.side;
            let square = this.square;
            let squareNum;
            for (squareNum = 0; squareNum < this.squareSum; squareNum++){ //初始化
                square[squareNum] = {
                    color: 0,
                    gridLink: [],
                    isFilled: false,
                    position: {x: squareNum % side,y: parseInt(squareNum / side,10)}
                };
            }
            this.initSquareLink();
        }

        initSquareLink(){
            let side = this.side;
            let i,j;
            for (i = 0; i < side; i++) {
                for (j = 0; j < side; j++) {
                    if ((i - 1) >= 0) this.square[i * side + j].gridLink.push((i - 1) * side + j);
                    if ((j - 1) >= 0) this.square[i * side + j].gridLink.push(i * side + j - 1);
                    if ((i + 1) < side) this.square[i * side + j].gridLink.push((i + 1) * side + j);
                    if ((j + 1) < side) this.square[i * side + j].gridLink.push(i * side + j + 1);
                    this.square[i * side + j].gridLink.sort((a,b) => a-b);//从小大到排序
                }
            }
        }

        isEmpty(){
            let i;
            let isEmpty;
            for (i = 0; i < this.blockSum; i++) {
                if (this.block[i].isFilled == false) {
                    isEmpty = true;
                    break;
                }
            }
            if (i == this.blockSum) isEmpty = false;
            return isEmpty;
        }

        Arrive(blockNum1,blockNum2){
            let temp = this.BFS(blockNum1,blockNum2);
            if (temp.length === 0) return false;
            else return true;
        }

        randomNum(){
            let tempNum = -1;
            while (tempNum<0||this.square[tempNum].isFilled){
                tempNum = parseInt(Math.random() * this.side *this.side,10);
            }
            return tempNum;
        }

        addPiece(squareNum){
            this.square[squareNum].isFilled = true;
            let temp = this.square[squareNum].gridLink;
            for (let i = 0; i < temp.length; i++) {
                let currentSquare = this.square[temp[i]].gridLink;
                for (let j = 0; j < currentSquare.length; j++) {
                    if (currentSquare[j] == squareNum) currentSquare.splice(j,1);
                }
            }
            this.square[squareNum].gridLink = [];
        }

        deletePiece(squareNum){
            let i=0;
            this.square[squareNum].isFilled = false;
            let temp = this.square[squareNum].gridLink;
            if (this.square[squareNum].position.x-1>=0) temp.push(squareNum - 1);
            if (this.square[squareNum].position.x+1<this.sideLength) temp.push(squareNum + 1);
            if (this.square[squareNum].position.y-1>=0) temp.push(squareNum - this.sideLength);
            if (this.square[squareNum].position.y+1<this.sideLength) temp.push(squareNum + this.sideLength);
            temp.sort((a,b) => a-b);//从小到大排序
            for (i = 0; i < temp.length; i++) {
                this.square[temp[i]].gridLink.push(squareNum);
                this.square[temp[i]].gridLink.sort((a,b) => a-b);//从小到大排序
            }
        }

        BFS(squareNum1,squareNum2){
            let tempQ = [];
            let currentSquareLinks;
            let visited = [];
            let pathRecord = []; //记录路径
            let isEnd = false; //是否寻找到目标点
            let i=0;
            for (i = 0; i < this.squareSum; i++) {
                visited[i] = false;
                pathRecord[i] = -1;
            } //访问初始化
            visited[squareNum1] = true;
            tempQ.push(squareNum1);
            while (!isEnd) {
                //确定首元素链接列表
                if(typeof (this.square[tempQ[0]]) !=="undefined" && tempQ[0].length !==0) currentSquareLinks = this.square[tempQ[0]].gridLink;
                else { 
                    console.log("This piece can't get there.");
                    break; 
                }
                for (i = 0; i < currentSquareLinks.length; i++) {
                    if (visited[currentSquareLinks[i]] == false) {
                        if (currentSquareLinks[i] == squareNum2) {
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
                i = squareNum2;
                let arr = [];
                while (pathRecord[i] != -1) {
                    arr.unshift(pathRecord[i]);
                    i = pathRecord[i];
                }
                arr.push(squareNum2);
                console.log(arr);
                return arr;
            } else {
                return [];
            }
        }
    }

    //输出类
    exports.Renderer = Renderer;
    exports.Board = Board;

})))