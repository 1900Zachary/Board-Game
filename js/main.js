var GameContainer = document.getElementById("GameContainer");
var renderer = new GRID.Renderer(GameContainer.clientWidth,GameContainer.clientHeight);
var board = new GRID.Board(9);
GameContainer.appendChild(renderer.domElement);
board.setColor("#E26A6A","#F1C40F","#C0392D","#8E44AD","#2ECC71","#D35400","#2980D9");
board.randomColor(5);
board.addPiece(5);

animate();

renderer.domElement.addEventListener("click",(e) => {
    let x = e.x - parseInt(renderer.domElement.getBoundingClientRect().left,10);
    let y = e.y - parseInt(renderer.domElement.getBoundingClientRect().top,10);
    action(x,y);
});

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
        }else console.log(`piece[${num}] was selected`);
    }else if (typeof board.piece[board.tempSelectedNum] === "object") {
        if (board.piece[board.tempSelectedNum].select) {
            movePiece(board.tempSelectedNum,num);
            console.log(`square[${num}] is empty`);
        }
    }
    board.tempSelectedNum = num;
}

function movePiece(num1,num2){
    board.data.deletePiece(num1);
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
    let m2;
    (function m(){
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
        board.piece[num1].position = currentPosition;
        console.log(board.piece[num1].position);

        if (currentPosition.x!=endPostion.x||currentPosition.y!=endPostion.y){
            m2 = setTimeout(m,16.7);
        }else {
            clearTimeout(m2);
        }
    }())
}

function LocationFinder(a,b,c){ //判断点b是否在ac直线上
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

function render(){
    renderer.render(board);
}

function animate(){
    requestAnimationFrame(animate);
    render();
}