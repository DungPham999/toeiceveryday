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


const container =
document.getElementById(
"exerciseContainer"
);


container.innerHTML="";


ex.questions.forEach(q=>{


const box =
document.createElement("div");


box.className="question";


box.innerHTML=`

<h3>
Question ${q.number}
</h3>


${q.image ?
`<img src="../../units/${CURRENT_UNIT}/${q.image}">`
:""}


<audio controls>

<source src="../../units/${CURRENT_UNIT}/${ex.audio}">

</audio>



<p>${q.script}</p>


<div>

${q.choices.map((c,i)=>

`
<button onclick="
checkAnswer(${q.number},${i},${q.answer})
">
${String.fromCharCode(65+i)}.
${c}
</button>

`

).join("")}

</div>


<div id="result-${q.number}">

</div>


`;



container.appendChild(box);


});


}
