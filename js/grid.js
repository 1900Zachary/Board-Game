(function(factory){
    factory((this.GRID={}));
}(((exports) => {
    class Renderer{
        constructor(width,height){
            this.domElement = document.createElement("canvas");
            this.setSize(width,height);
            this.board = null;
            if (this.domElement.getContext) this.context = this.domElement.getContext("2d");
        }

        add(object){
            if (object.constructor.name === "Board") {
                this.board = object;
                this.board.setSize(this.width,this.height);
                object.context = this.context;
            }
            if (object.constructor.name === "Piece") {
                this.piece[object.num] = object;
            }
        }

        setSize(width,height){
            this.width = width;
            this.height = height;
            this.domElement.width = width;
            this.domElement.height = height;
        }

        render(){
            this.clearCanvas();
            this.board.draw();
        }

        clearCanvas(){
            this.context.clearRect(0,0,this.width,this.height)
        }
    }

    class Board{
        constructor(side){
            this.side = side;
            this.context = null;
        }

        setSize(width,height){
            this.width = width;
            this.height = height;
        }

        draw(){
            this.context.fillStyle = "#dddddd";
            this.context.fillRect(0,0,this.width,this.height);
        }
    }

    class Piece{
        constructor(color){
            this.color = color;
            this.position = {
                x: 0,
                y: 0
            };
            this.position.set = function(x,y){
                this.x = x;
                this.y = y;
            }
        }
        
    }

    exports.Piece = Piece;
    exports.Renderer = Renderer;
    exports.Board = Board;

})))