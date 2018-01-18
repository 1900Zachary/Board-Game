/// <reference path="g.js"/>
//定义游戏属性
const pieceColor = ["#ff0000","#ff80c0","#8000ff","#80ffff","#ff8000","#80ff00","#0000ff"];
const theme = {background: "#46A7AF",blockDark: "#317E8A",blockLight: "#46A7AF",gridBackground: "#3A909A",gridShadow: "#00000099"}
const sideLength = 9;
const speed = 18;
//初始化基本参数
var isKeepWidth = true;
var p = [...Array(80).fill(0)];
let isSelected = false;
var score=0;
let saveN;
var storeColor = [0,0,0];
//分数区
let scoreArea = document.getElementById("score_area");
console.log(scoreArea);
function updateScoreArea(SA){
    let positionX;
    if (isKeepWidth){
        SA.style.width = `${window.innerHeight*9/16}px`;
        SA.style.height = `${window.innerHeight*3.5/16}px`;
        positionX = (window.innerWidth-window.innerHeight*9/16)/2;
        console.log(positionX);
    }
    console.log(positionX);
    SA.style.transform = "translateX("+positionX+"px)";
}
//棋盘层
class GridDisplay {
    constructor(cParentNode) {
        this.canvas = document.createElement("canvas");
        this.canvas.style.display = "block";
        this.ParentNode = cParentNode;
        this.canvas.id = "gridDisplay";
        this.canvas.style.position = "fixed";
        if (this.canvas.getContext) this.context = this.canvas.getContext("2d");
    }

    //初始化
    start(){
        this.AddToDocument();
        this.update();
    }

    //将该图层加入页面
    AddToDocument() {
        this.ParentNode.appendChild(this.canvas);
    }

    //清除画布
    clear() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height)
    }

    NumtoPos(num) {
        return {x: ((num % sideLength) * this.gridPieceW),y: (parseInt(num / sideLength,10) * this.gridPieceW)};
    }

    //捕捉鼠标位置
    PosToNum(x,y) {
        let num;
        num = parseInt((x - this.frame - this.positionX) / this.gridPieceW,10) + parseInt((y - this.frame - this.positionY) / this.gridPieceW,10) * sideLength;
        return num;
    }

    //画出棋盘格
    GridDrawing() {
        let i,j,num,position;
        this.context.translate(this.frame,this.frame);//移动原点位置
        this.context.fillStyle = theme.gridBackground;//填色
        this.context.shadowColor = theme.gridShadow;
        this.context.shadowBlur = 15;
        this.context.fillRect(0,0,this.gridW,this.gridW);
        this.context.shadowColor = "none";
        this.context.shadowBlur = 0;
        for (i = 0; i < sideLength; i += 2) {
            for (j = 0; j < sideLength; j += 2) {
                num = (i + j * sideLength);
                position = this.NumtoPos(num);
                this.context.fillStyle = theme.blockDark;
                this.context.fillRect(position.x,position.y,this.gridPieceW,this.gridPieceW);
                if ((i + 1 < sideLength) && (j + 1 < sideLength)) {
                    num = (i + 1) + (j + 1) * sideLength;
                    position = this.NumtoPos(num);
                    this.context.fillStyle = theme.blockLight;
                    this.context.fillRect(position.x,position.y,this.gridPieceW,this.gridPieceW);
                }
            }
        }
    }

    //更新
    update() {
        if (isKeepWidth) {
            this.canvas.height = window.innerHeight * sideLength / 16;
            this.canvas.width = this.canvas.height;
            this.positionY = window.innerHeight * 3.5 / 16;
            this.positionX = (window.innerWidth - (window.innerHeight * sideLength / 16)) / 2;
        } else {
            this.canvas.width = window.innerWidth;
            this.canvas.height = this.canvas.width;
            this.positionY = (window.innerHeight - window.innerWidth) / 2;
            this.positionX = 0;
        }
        this.gridW = this.canvas.width * 0.94;
        this.gridPieceW = this.gridW / sideLength;
        this.frame = (this.canvas.width - this.gridW) / 2;
        this.canvas.style.transform = `translate(${this.positionX}px,${this.positionY}px)`;
        this.context.translate(-this.frame,-this.frame);
        this.clear();
        this.context.translate(this.frame,this.frame);
        this.GridDrawing(this.canvas.width);
    }
}
//棋子
class Piece {
    constructor(num,GD) {
        this.num = num;
        this.context = GD.context;
        this.GD = GD;
    }

    //初始化棋子
    AddPiece(colorNum) {
        this.colorNum = colorNum;
        this.newPos(this.num);
        this.color = pieceColor[colorNum - 1];
        g.block[this.num].color = colorNum;
        this.update();
    }

    //更改棋子属性
    newPos(newNum) {
        // g.block[this.num].color = -1;
        // this.num = newNum;
        // g.block[this.num].color = this.colorNum;
        this.position = this.TurnToPosition(newNum);
        this.radius = this.GD.gridPieceW * 0.45;
    }

    //更新棋子位置
    update() {
        this.context.beginPath();
        this.context.save();
        this.context.fillStyle = this.color;
        this.context.shadowColor = "#00000099";
        this.context.shadowBlur = 15;
        this.context.arc(this.position.x,this.position.y,this.radius,0,Math.PI * 2,false);
        this.context.fill();
        g.AddPiece(this.num);
        this.context.restore();
        this.context.closePath();
    }

    //转换成成坐标
    TurnToPosition(num){
        let position = this.GD.NumtoPos(num);
        return({x: position.x+this.GD.gridPieceW / 2,y: position.y+this.GD.gridPieceW / 2});
    }
}
//第二次初始化参数
var gridDisplay = new GridDisplay(document.body);
var g = new Grid(sideLength);
//movePiece
function MovePiece(p1,tagetNum){ //传入p[num]棋子,移动的目标格，总时长
    let currentPosition = p1.TurnToPosition(p1.num);
    // console.log(currentPosition);
    let lastPosition = p1.TurnToPosition(tagetNum);
    let routePoint = g.BFS(p1.num,tagetNum);
    let routePosition = [];
    let temp;
    for (let i = 0;i<routePoint.length;i++){
        temp = LocationFinder(p1.TurnToPosition(routePoint[i-1]),p1.TurnToPosition(routePoint[i]),p1.TurnToPosition(routePoint[i+1]));
        if (i ==0||i==routePoint.length-1) routePosition.push(p1.TurnToPosition(routePoint[i]));
        else if (!temp.isBetween) routePosition.push(p1.TurnToPosition(routePoint[i]));
    }
    let j =0;
    let bs,ps;
    m2();
    function m2(){
        bs = LocationFinder(routePosition[j],currentPosition,routePosition[j+1]);
        currentPosition[bs.derection]+=speed*bs.sign;
        ps = LocationFinder(routePosition[j],currentPosition,routePosition[j+1]);
        /*eslint-disable*/
        if (ps.isBetween==false){      
            if (typeof routePosition[j+2]!="object"){           
                currentPosition.x=routePosition[j+1].x;
                currentPosition.y=routePosition[j+1].y;
            }else{
                ps = LocationFinder(routePosition[j+1],currentPosition,routePosition[j+2]);
                currentPosition[ps.derection] = routePosition[j+1][ps.derection]+Math.abs(routePosition[j+1][bs.derection]-currentPosition[bs.derection])*ps.sign;
                currentPosition[bs.derection] = routePosition[j+1][bs.derection];
                j+=1;
            }
        }
       /*eslint-enable*/
        p1.GD.clear();
        p1.position.x = currentPosition.x;
        p1.position.y = currentPosition.y;

        if (currentPosition.x!=lastPosition.x||currentPosition.y!=lastPosition.y){
            window.requestAnimationFrame(m2);
        }else {
            window.cancelAnimationFrame(m2);
            g.DeletePiece(p1.num);
            g.AddPiece(tagetNum);
    
            g.block[tagetNum].color = g.block[p1.num].color;
            g.block[p1.num].color = -1;
            p1.num = tagetNum;
            p1.position = p1.TurnToPosition(tagetNum);
            p1.radius = p1.GD.gridPieceW * 0.45;

            if (!Eliminate(tagetNum)){
                RandomAddPiece(3);
                RandomColor(3);
            }
        }
        updateAll();
    }
}
//鉴定点的方向走向，返回方向和B点是否在AC上。
function LocationFinder(a,b,c){
    if (a.x>c.x||a.y>c.y){
        if (a.x>=b.x&&b.x>c.x&&a.y==c.y) return {derection: "x",isBetween: true,sign: -1};
        else if (a.y>=b.y&&b.y>c.y&&a.x==c.x) return {derection: "y",isBetween: true,sign: -1};
        else if (a.x>c.x) return {derection: "x",isBetween: false,sign: -1};
        else if (a.y>c.y) return {derection: "y",isBetween: false,sign: -1};
    }else if (a.x<=b.x&&b.x<c.x&&a.y==c.y) return{derection: "x",isBetween: true,sign: 1};
    else if (a.y<=b.y&&b.y<c.y&&a.x==c.x) return{derection: "y",isBetween: true,sign: 1};
    else if (a.x<c.x) return{derection: "x",isBetween: false,sign: 1};
    else if (a.y<c.y) return{derection: "y",isBetween: false,sign: 1};
}
//随机生产3种颜色
function RandomColor(n) {
    let count = 0;
    let randomNum = 0;
    while (count != n) {
        randomNum = parseInt(Math.random() * pieceColor.length + 1,10);
        storeColor[count] = randomNum;
        count += 1;
        if (g.isEmpty == false) break;
    }
}
//随机添加三颗棋子
function RandomAddPiece(n) {
    let count = 0;
    let randomNum = 0;
    while (count != n) {
        randomNum = parseInt(Math.random() * 81,10);
        if (g.block[randomNum].isFilled == false) {
            p[randomNum] = new Piece(randomNum,gridDisplay);
            p[randomNum].AddPiece(storeColor[count]);
            Eliminate(randomNum);
            count += 1;
        }
        if (g.isEmpty == false) break;
    }
}
//消除
function Eliminate(blockNum){
    let block = g.block;
    let s = sideLength;
    let EliminateArray = [];
    let record = [blockNum];
    Search(block[blockNum].position.x,block[blockNum].position.y,0,1,true,1);
    Search(block[blockNum].position.x,block[blockNum].position.y,1,1,true,1);
    Search(block[blockNum].position.x,block[blockNum].position.y,1,0,true,1);
    Search(block[blockNum].position.x,block[blockNum].position.y,1,-1,true,1);
    if (EliminateArray.length >4){
        for (let i=0;i<EliminateArray.length;i++){
            p[EliminateArray[i]] = [];
            g.DeletePiece(EliminateArray[i]);
        }
        score+=10+(EliminateArray.length-5)*(EliminateArray.length-5)*2;
        document.getElementById("score_area").innerHTML = score;
        return true;
    }else{
        return false;
    }

    function Search(x,y,i,j,d,count){
        if(d){
            //正向搜索
            if(x+i<s&&x+i>-1&&y+j<s&&y+j>-1&&block[s*(y+j)+(x+i)].isFilled&&block[s*(y+j)+(x+i)].color==block[blockNum].color){
                record.push(s*(y+j)+(x+i));
                Search(x+i,y+j,i,j,d,count+1);
            }else{
                Search(x-count*i+i,y-count*j+j,i,j,!d,count);
            }
            //反向
        }else if(x-i<s&&x-i>-1&&y-j<s&&y-j>-1&&block[s*(y-j)+(x-i)].isFilled&&block[s*(y-j)+(x-i)].color==block[blockNum].color){
            record.push(s*(y-j)+(x-i));
            Search(x-i,y-j,i,j,d,count+1);
        }else {
            if (count>4) {
                EliminateArray = concat(EliminateArray,record); 
            }
            record = [blockNum];
        }
    }
}
//数组合并操作
var concat = (function(){
    // concat arr1 and arr2 without duplication.
    var concats ;
    concats = function(arr1,arr2) {
        for (var i=arr2.length-1;i>=0;i--) {
            if(arr1.indexOf(arr2[i]) === -1) arr1.push(arr2[i]);
        }
    };
    return function(arr) {
        var result = arr.slice();
        for (var i=arguments.length-1;i>=1;i--) {
            concats(result,arguments[i]);
        }
        return result;
    };
}());
//监听
function AddEventListeners() {
    function resizeListener() {
        window.removeEventListener("resize",resizeListener);
        setTimeout(() => {
            resizeUpdateAll();
            window.addEventListener("resize",resizeListener);
        },500)
    }
    window.addEventListener("resize",resizeListener);
    gridDisplay.canvas.addEventListener("click",ClickEvent);
    gridDisplay.canvas.addEventListener("touchstart",ClickEvent);
}
//点击事件监听
function ClickEvent(e){
    let tempN = gridDisplay.PosToNum(e.clientX,e.clientY);
    if (typeof (g.block[tempN]) !== "undefined"){
        if (g.block[tempN].isFilled) { //当前位置有棋子
            if (typeof (saveN) !== "undefined"){
                if (g.block[saveN].isFilled == false && isSelected) g.AddPiece(saveN);
            }
            isSelected = true;
            saveN = tempN;
            g.DeletePiece(saveN);
        } else if (saveN != tempN) if(isSelected && g.Arrive(saveN,tempN)) { //当前位置没有棋子，且为选中态，上个棋盘格与当前棋盘格连通
            gridDisplay.clear();
            MovePiece(p[saveN],tempN);
            isSelected = false;
            p[tempN] = p[saveN];
            p[saveN]=0;

            updateAll();
        }
    }
    
}
//resize重新绘图
function resizeUpdateAll() {
    if ((window.innerWidth / window.innerHeight) >= sideLength / 16) isKeepWidth = true
    else isKeepWidth = false;
    gridDisplay.update();
    for (let i in p) {
        if (p[i] != 0) {
            p[i].newPos(i);
            p[i].update();
        }
    }
}
//重新绘图
function updateAll() {
    if ((window.innerWidth / window.innerHeight) >= sideLength / 16) isKeepWidth = true
    else isKeepWidth = false;
    updateScoreArea(scoreArea);
    gridDisplay.update();
    for (let i in p) {
        if (p[i] != 0) {
            p[i].update();
        }
    }
}
//主执行函数
(function () {
    g.Start();
    gridDisplay.start();
    RandomColor(5);
    RandomAddPiece(5);
    updateAll();//先更新下画面
    AddEventListeners();//添加监听
}());