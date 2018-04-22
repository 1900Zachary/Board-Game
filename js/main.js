var GameContainer = document.getElementById("GameContainer");
var nextBallsFrame = document.getElementById("NextBallsFrame");
var renderer = new GRID.Renderer(GameContainer.clientWidth,GameContainer.clientHeight);
var renderer2 = new GRID.Renderer(nextBallsFrame.clientWidth,nextBallsFrame.clientHeight);
var board = new GRID.Board(9);
var nextBalls = new GRID.NextBalls();
let tempSelectedNum = -1;
let animateTag;
let score=0;
init(); //初始化
animate();//动画
listener(); //监听

function init(){
    GameContainer.appendChild(renderer.domElement);
    nextBallsFrame.appendChild(renderer2.domElement);
    board.setColor("#E26A6A","#F1C40F","#C0392D","#8E44AD","#2ECC71","#D35400","#2980D9");
    board.randomColor(5);
    board.addPiece(5);
    board.randomColor(3);
    nextBalls.colorStore = board.tempColor;
}

function listener(){
    renderer.domElement.addEventListener("click",(e) => {
        let x = e.x - parseInt(renderer.domElement.getBoundingClientRect().left,10);
        let y = e.y - parseInt(renderer.domElement.getBoundingClientRect().top,10);
        action(x,y);
    });
}

//点击事件触发-逻辑
function action(x,y){
    let i;
    let num = parseInt(y/board.squareLength,10)*board.side + parseInt(x/board.squareLength,10);
    if (typeof board.piece[num] === "object") {
        if (board.piece[num].select === false) {
            for(i=0;i< board.side * board.side ;i++){
                if (board.data.square[i].isFilled){
                    board.piece[i].select = false;
                }
            }//初始化
            board.piece[num].selectSwitch();
            console.log(`piece[${num}] is selected`)
        }else console.log(`piece[${num}] was selected`);
    }else if (typeof board.piece[tempSelectedNum] === "object") {
        if (board.piece[tempSelectedNum].select&& board.isMoving===false&&board.data.Arrive(tempSelectedNum,num)) {
            movePiece(tempSelectedNum,num);
            let moveT = setInterval(() => {
                if (board.isMoving === false){
                    board.piece[num].selectSwitch();
                    tempSelectedNum = -1;
                    if (Eliminate(num) == false){
                        board.addPiece(3);
                        for(i=0;i<board.randomPosStore.length;i++){
                            Eliminate(board.randomPosStore[i]);
                        }
                        board.randomColor(3);
                        nextBalls.colorStore = board.tempColor;
                        animate();
                    }else{
                        animate();
                    }
                    clearInterval(moveT);
                }
            },100);
            console.log(`square[${num}] is empty`);
        }
    }
    tempSelectedNum = num;
}
//移动棋子动画
function movePiece(num1,num2){
    board.isMoving = true;
    let currentPosition = board.num2Position(num1);//当前坐标
    let endPostion = board.num2Position(num2);     //终点坐标
    let piecePath = board.data.BFS(num1,num2);    //路径 
    board.data.addPiece(num1);
    let pieceKeyPath = [];
    let temp;
    for (let i = 0;i<piecePath.length;i++){
        temp = LocationFinder(board.num2Position(piecePath[i-1]),board.num2Position(piecePath[i]),board.num2Position(piecePath[i+1]));
        if (i ==0||i==piecePath.length-1) pieceKeyPath.push(board.num2Position(piecePath[i]));
        else if (!temp.isBetween) pieceKeyPath.push(board.num2Position(piecePath[i]));
    }

    let j = 0;
    let bs,ps;
    let speed = 18;
    let animateTag1;
    (function moveAnimate(){
        bs = LocationFinder(pieceKeyPath[j],currentPosition,pieceKeyPath[j+1]);
        currentPosition[bs.derection]+=speed*bs.sign;
        ps = LocationFinder(pieceKeyPath[j],currentPosition,pieceKeyPath[j+1]);
        if (ps.isBetween==false){
            if (typeof pieceKeyPath[j+2] == "object"){     
                ps = LocationFinder(pieceKeyPath[j+1],currentPosition,pieceKeyPath[j+2]);
                currentPosition[ps.derection] = pieceKeyPath[j+1][ps.derection]+Math.abs(pieceKeyPath[j+1][bs.derection]-currentPosition[bs.derection])*ps.sign;
                currentPosition[bs.derection] = pieceKeyPath[j+1][bs.derection];
                j+=1;
            }else{
                currentPosition.x=pieceKeyPath[j+1].x;
                currentPosition.y=pieceKeyPath[j+1].y;
            }
        }
        board.piece[num1].position.set(currentPosition.x,currentPosition.y);
        animate();
        if (currentPosition.x!=endPostion.x||currentPosition.y!=endPostion.y){
            animateTag1 = requestAnimationFrame(moveAnimate);
        }else {
            cancelAnimationFrame(animateTag1);
            board.isMoving = false;
            board.piece[num2] = board.piece[num1];
            board.deletePiece(num1);
            board.data.addPiece(num2);
        }
    }())
}

//判断点b是否在ac直线上，返回{轴，是否在ac上，轴正负向}
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

//消除
function Eliminate(num){
    let square = board.data.square;
    let s = board.side;
    let EliminateArray = [];
    let record = [num];
    Search(square[num].position.x,square[num].position.y,0,1,true,1);
    Search(square[num].position.x,square[num].position.y,1,1,true,1);
    Search(square[num].position.x,square[num].position.y,1,0,true,1);
    Search(square[num].position.x,square[num].position.y,1,-1,true,1);
    if (EliminateArray.length >4){
        for (let i=0;i<EliminateArray.length;i++){
            board.deletePiece(EliminateArray[i]);
        }
        console.log(EliminateArray.length);
        score+=10+(EliminateArray.length-5)*(EliminateArray.length-5)*2;
        console.log(score);
        return true;
    }else{
        return false;
    }

    function Search(x,y,i,j,d,count){
        if(d){
            //正向搜索
            if(x+i<s&&x+i>-1&&y+j<s&&y+j>-1&&square[s*(y+j)+(x+i)].isFilled&&board.piece[s*(y+j)+(x+i)].color==board.piece[num].color){
                record.push(s*(y+j)+(x+i));
                Search(x+i,y+j,i,j,d,count+1);
            }else{
                Search(x-count*i+i,y-count*j+j,i,j,!d,count);
            }
            //反向
        }else if(x-i<s&&x-i>-1&&y-j<s&&y-j>-1&&square[s*(y-j)+(x-i)].isFilled&&board.piece[s*(y-j)+(x-i)].color==board.piece[num].color){
            record.push(s*(y-j)+(x-i));
            Search(x-i,y-j,i,j,d,count+1);
        }else {
            if (count>4) {
                EliminateArray = concat(EliminateArray,record); 
            }
            record = [num];
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
//渲染
function render(){
    renderer.render(board);
    renderer2.render(nextBalls);
}
//动画
function animate(){
    if (board.isMoving) animateTag = requestAnimationFrame(animate);
    else cancelAnimationFrame(animateTag);
    render();
}