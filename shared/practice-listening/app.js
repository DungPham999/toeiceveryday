function startPractice(data){

document.getElementById("title").innerHTML=data.title;


const list=document.getElementById("exerciseList");


data.sections.forEach(section=>{


let h=document.createElement("h2");
h.innerHTML=section.label;
list.appendChild(h);


section.exercises.forEach(ex=>{


let btn=document.createElement("button");

btn.innerHTML=ex.title;


btn.onclick=function(){

showExercise(ex);

};


list.appendChild(btn);


});


});


}



function showExercise(ex){


const box=document.getElementById("content");

box.innerHTML="";


ex.questions.forEach(q=>{


box.innerHTML+=`

<hr>

<h2>
Question ${q.number}
</h2>


<img 
width="400"
src="../../practice/a-lis-1/listening/${q.image}"
>


<br>


<audio controls>

<source 
src="../../practice/a-lis-1/listening/${ex.audio}"
>

</audio>


<br><br>


${q.choices.map((c,i)=>`

<button onclick="
check(${q.number},${i},${q.answer})
">

${String.fromCharCode(65+i)}.
${c}

</button>


`).join("")}


<div id="r${q.number}"></div>


`;


});


}




function check(q,a,c){


document.getElementById("r"+q).innerHTML=

a===c
?
"✅ Correct"
:
"❌ Answer: "+String.fromCharCode(65+c);


}
