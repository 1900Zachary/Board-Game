var GameContainer = document.getElementById("GameContainer");
console.log(GameContainer.getBoundingClientRect().width);
var r = new GRID.Renderer(GameContainer.clientWidth,GameContainer.clientHeight);
var b = new GRID.Board(9);
var p = new GRID.Piece("#FF0000");
GameContainer.appendChild(r.domElement);
p.position.set(10,100);
console.log(p.position);
r.render(b);