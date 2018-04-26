(function(factory){
    factory((this.GRID={}));
}(((exports) => { //封装，新建GRID模块，包含Renderer,Board,Piece,boardData类
    class Renderer{//-Renderer类，渲染
        constructor(width,height){
            this.domElement = document.createElement("canvas");
            this.devicePixelRatio = window.devicePixelRatio || 1;
            this.ratio = devicePixelRatio;
            if (this.domElement.getContext) this.context = this.domElement.getContext("2d");
            this.setSize(width,height);
        }

        //设置宽高，并设置dom元素宽高
        setSize(width,height){
            this.width = width;
            this.height = height;
            this.domElement.width = width*this.ratio;
            this.domElement.height = height*this.ratio;
            this.domElement.style.width = `${width}px`;
            this.domElement.style.height = `${height}px`;
            this.context.scale(this.ratio,this.ratio);
        }

        //渲染page
        render(page){
            this.clearCanvas();
            page.setSize(this.width,this.height);
            page.setContext(this.context);
            page.draw();
        }

        //清除page
        clearCanvas(){
            this.context.clearRect(0,0,this.width,this.height)
        }
    }

    class NextBalls{
        constructor(){
            this.colorStore = [];
        }

        setSize(w,h){
            this.width = w;
            this.height = h;
            this.radius = w/16;
        }

        setContext(context){
            this.context = context;
        }

        draw(){
            this.context.beginPath();
            this.context.fillStyle = this.colorStore[0];
            this.context.arc(this.width/2-this.radius*3,this.height/2,this.radius,0,Math.PI * 2,false);
            this.context.fill();
            this.context.closePath();
            this.context.beginPath();
            this.context.fillStyle = this.colorStore[1];
            this.context.arc(this.width/2,this.height/2,this.radius,0,Math.PI * 2,false);
            this.context.fill();
            this.context.closePath();
            this.context.beginPath();
            this.context.fillStyle = this.colorStore[2];
            this.context.arc(this.width/2+this.radius*3,this.height/2,this.radius,0,Math.PI * 2,false);
            this.context.fill();
            this.context.closePath();
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
            this.pieceRadius = 0;
            this.isMoving = false;
            this.isFull = false;
            this.randomPosStore = [];
        }

        setContext(context){
            let i;
            this.context = context;
            for(i=0;i< this.side * this.side ;i++){
                if (this.data.square[i].isFilled){
                    this.piece[i].context = this.context;
                }
            }
        }

        setColor(){
            for(let i = 0;i<arguments.length;i++){
                this.color[i] = arguments[i];
            }
        }

        setSize(width,height){
            let i;
            this.width = width;
            this.height = height;
            this.squareLength = this.width / this.side;
            this.pieceRadius = this.squareLength * 0.45;
            for(i=0;i< this.side * this.side ;i++){
                if (this.data.square[i].isFilled&& this.isMoving===false){
                    this.piece[i].radius = this.pieceRadius;
                    this.piece[i].position.set(this.num2Position(i).x,this.num2Position(i).y);
                }
            }
        }

        num2Position(num){
            let x = (num%this.side)*this.squareLength+this.squareLength/2;
            let y = parseInt(num/this.side,10)*this.squareLength+this.squareLength/2;
            return {x: x,y: y};
        }
        
        //在随机位置添加3个颜色队列里的棋子
        addPiece(n){
            let i;
            let tempNum;
            this.randomPosStore = [];
            for (i = 0; i<n; i++){
                if (this.data.isEmpty){
                    tempNum = this.data.randomNum();
                    this.randomPosStore.push(tempNum);
                    this.piece[tempNum] = new Piece(tempNum,this.tempColor[i]);
                    this.data.addPiece(tempNum); //更新data
                }else{
                    this.isFull = true;
                    break;
                }
            }
        }

        deletePiece(num){
            Reflect.deleteProperty(this.piece,[num]);
            this.data.deletePiece(num);
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

        draw(){
            let i=0;
            this.context.fillStyle = "#dddddd";
            this.context.fillRect(0,0,this.width,this.height);
            for(i=0;i< this.side * this.side ;i++){
                if (this.data.square[i].isFilled){
                    this.piece[i].draw();
                }
            }
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
            this.context = null;
            this.radius = null;
            this.select = false;
        }

        draw(){
            this.context.beginPath();
            this.context.save();
            this.context.fillStyle = this.color;
            this.context.shadowColor = "#00000099";
            this.context.shadowBlur = 15;
            this.context.arc(this.position.x,this.position.y,this.radius,0,Math.PI * 2,false);
            this.context.fill();
            this.context.restore();
            this.context.closePath();
        }

        selectSwitch(){
            if (this.select) this.select = false;
            else this.select = true;
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
            for (i = 0; i < this.squareSum; i++) {
                if (this.square[i].isFilled == false) {
                    isEmpty = true;
                    break;
                }
            }
            if (i == this.squareSum) isEmpty = false;
            return isEmpty;
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

        //删除棋子,更新链接表
        deletePiece(squareNum){
            //将第 squareNum 格设为空，将其上下左右格，存在且空的，加入其连接图中。
            let i=0;
            this.square[squareNum].isFilled = false;
            let temp = this.square[squareNum].gridLink;
            if (this.square[squareNum].position.x-1>=0 && this.square[squareNum-1].isFilled===false) temp.push(squareNum - 1);
            if (this.square[squareNum].position.x+1<this.side && this.square[squareNum+1].isFilled===false) temp.push(squareNum + 1);
            if (this.square[squareNum].position.y-1>=0 && this.square[squareNum-this.side].isFilled===false) temp.push(squareNum - this.side);
            if (this.square[squareNum].position.y+1<this.side && this.square[squareNum+this.side].isFilled===false) temp.push(squareNum + this.side);
            temp.sort((a,b) => a-b);//从小到大排序
            for (i = 0; i < temp.length; i++) {
                this.square[temp[i]].gridLink.push(squareNum);
                this.square[temp[i]].gridLink.sort((a,b) => a-b);//从小到大排序
            }
        }

        //广度搜索
        BFS(squareNum1,squareNum2){
            let tempQ = [];
            let currentSquareLinks;
            let visited = [];
            let pathRecord = []; //记录路径
            let isEnd = false; //是否寻找到目标点
            let i=0;
            let deleteTag = false;
            if (this.square[squareNum1].isFilled) {
                this.deletePiece(squareNum1);
                deleteTag = true;
            }
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
            if(deleteTag){
                this.addPiece(squareNum1);
                deleteTag = false;
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
                return arr;
            } else {
                return [];
            }
        }
    }

    //输出类
    exports.Renderer = Renderer;
    exports.Board = Board;
    exports.NextBalls = NextBalls;

})))