const params = new URLSearchParams(
window.location.search
);


const unit =
params.get("unit");


if(!unit){

document.body.innerHTML =
"No practice selected";

throw new Error("Missing unit");

}


const script =
document.createElement("script");


script.src =
`../../tests/practice/${unit}/data.js`;


script.onload=function(){

startPractice(
window.PRACTICE_DATA
);

};


document.head.appendChild(script);
