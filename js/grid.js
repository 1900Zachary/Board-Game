(function(global,factory){
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports)
        : typeof define === "function" && define.amd ? define(["exports"],factory)
            : (factory((global.GRID = {})));
}(this,((exports) => {
    class Name {
        constructor(name){
            if (typeof this.InitBlockLink !== "function") {
                Name.prototype.sayName = function(){
                    console.log(name);
                }
            }
        }
    }
    exports.Name = Name;
})))

// class Name {
//     constructor(name){
//         if (typeof this.InitBlockLink !== "function") {
//             name.prototype.sayName = function(){
//                 console.log(name);
//             }
//         }
//     }
// }
// var GRID = {}
// gRID.Name = Name;