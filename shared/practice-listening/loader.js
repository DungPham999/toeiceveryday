(function(){

const params =
new URLSearchParams(window.location.search);


const unit =
params.get("unit");


if(!unit){

alert("Missing unit");

return;

}



const script =
document.createElement("script");


script.src =
`../../units/${unit}/data.js`;


script.onload=function(){

console.log(
"Loaded unit:",
unit
);


window.CURRENT_UNIT =
unit;


if(window.initPractice){

window.initPractice();

}

};



document.head.appendChild(script);


})();
