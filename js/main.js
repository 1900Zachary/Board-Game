var r = new GRID.Renderer(100,100);
var b = new GRID.Board(9,100,100);
r.add(b);
b.setSize(150,150);
console.log(r.board.width);