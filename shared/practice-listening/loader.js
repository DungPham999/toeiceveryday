const params = new URLSearchParams(window.location.search);

const unit = params.get("unit");


const script = document.createElement("script");

script.src = `../../practice/${unit}/listening/data.js`;


script.onload = function(){

    startPractice(PRACTICE_DATA);

};


document.head.appendChild(script);
