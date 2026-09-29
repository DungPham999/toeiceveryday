function initPractice(){


const data =
window.PRACTICE_DATA;



if(!data){

console.error(
"No PRACTICE_DATA"
);

return;

}



document
.getElementById("unitTitle")
.innerText =
data.title ||
"Practice Listening";



const container =
document.getElementById(
"exerciseContainer"
);



container.innerHTML="";



data.sections.forEach(section=>{


const sectionBox =
document.createElement("div");


sectionBox.className =
"section";



sectionBox.innerHTML =
`
<h2>
${section.label}
</h2>
`;



section.exercises.forEach(ex=>{


const btn =
document.createElement("button");


btn.innerText =
ex.label ||
"Exercise";


btn.onclick=function(){

loadExercise(ex);

};



sectionBox.appendChild(btn);



});



container.appendChild(
sectionBox
);



});


}



function loadExercise(ex){


console.log(
"Open exercise",
ex
);


}
