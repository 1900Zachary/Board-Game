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
            if (object.constructor.name === "Board") this.board = object;
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
        constructor(side,width,height){
            this.side = side;
            this.width = width;
            this.height = height;
        }

        setSize(width,height){
            this.width = width;
            this.height = height;
        }
    }

    exports.Renderer = Renderer;
    exports.Board = Board;

})))