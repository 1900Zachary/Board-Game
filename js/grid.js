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
            this.Data = new boardData(this.side);
        }

        setSize(width,height){
            this.width = width;
            this.height = height;
        }
        
        addPiece(object){
            if (object.constructor.name === "Piece") {
                this.piece[object.num] = object;
            }
        }

        draw(){
            this.context.fillStyle = "#dddddd";
            this.context.fillRect(0,0,this.width,this.height);
        }
    }

    class Piece{//-Board类,棋子
        constructor(color){
            this.color = color;
            this.position = {x: 0,y: 0};
            this.position.set = function(x,y){
                this.x = x;
                this.y = y;
            }
        }
        
    }
    class boardData{//-boardData类,棋盘数据
        constructor(side){
            this.side = side;
            this.squareSum = this.side * this.side;
            this.square = [...Array(this.squareSum)]; //定义square[i] 为第i格棋盘
            this.isEmpty = true;
        }

        Start(){
            let side = this.side;
            let square = this.square;
            let squareNum;
            for (squareNum = 0; squareNum < this.squareSum; squareNum++){
                square[squareNum] = {
                    color: 0,
                    gridLink: [],
                    isFilled: false,
                    position: {x: squareNum % side,y: parseInt(squareNum / side,10)}
                };
            }
        }
    }

    //输出类
    exports.Piece = Piece;
    exports.Renderer = Renderer;
    exports.Board = Board;

})))