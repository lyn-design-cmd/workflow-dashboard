let records =
JSON.parse(localStorage.getItem("records")) || [];

let chart;

function saveData(){
localStorage.setItem(
"records",
JSON.stringify(records)
);
}

function addRecord(){

const date =
document.getElementById("date").value;

const quantity =
parseInt(
document.getElementById("quantity").value
);

const target =
parseInt(
document.getElementById("target").value
);

if(!date || !quantity || !target){
alert("請輸入完整資料");
return;
}

records.push({
date,
quantity,
target
});

saveData();

renderTable();

updateDashboard();

updateChart();

document.getElementById("date").value="";
document.getElementById("quantity").value="";
document.getElementById("target").value="";
}

function deleteRecord(index){

if(confirm("確認刪除?")){

records.splice(index,1);

saveData();

renderTable();

updateDashboard();

updateChart();
}
}

function editRecord(index){

const newQty =
prompt(
"修改產量",
records[index].quantity
);

if(newQty){

records[index].quantity =
parseInt(newQty);

saveData();

renderTable();

updateDashboard();

updateChart();
}
}

function renderTable(){

const keyword =
document.getElementById("search").value;

let html="";

records
.filter(r=>r.date.includes(keyword))
.forEach((r,index)=>{

let rate=
((r.quantity/r.target)*100)
.toFixed(1);

html+=`

<tr>

<td>${r.date}</td>

<td>${r.quantity}</td>

<td>${r.target}</td>

<td>${rate}%</td>

<td>

<button
class="edit"
onclick="editRecord(${index})">

編輯

</button>

<button
class="delete"
onclick="deleteRecord(${index})">

刪除

</button>

</td>

</tr>

`;
});

document.getElementById(
"tableBody"
).innerHTML=html;
}

function updateDashboard(){

let total=
records.reduce(
(sum,r)=>sum+r.quantity,
0
);

let avg=
records.length
?
(total/records.length).toFixed(1)
:
0;

let today=
new Date()
.toISOString()
.split("T")[0];

let todayOutput=
records
.filter(r=>r.date===today)
.reduce(
(sum,r)=>sum+r.quantity,
0
);

let target=
records.reduce(
(sum,r)=>sum+r.target,
0
);

let achievement=
target
?
((total/target)*100).toFixed(1)
:
0;

document.getElementById(
"todayOutput"
).innerText=todayOutput;

document.getElementById(
"totalOutput"
).innerText=total;

document.getElementById(
"avgOutput"
).innerText=avg;

document.getElementById(
"achievement"
).innerText=
achievement+"%";
}

function updateChart(){

const ctx=
document.getElementById(
"productionChart"
);

if(chart){
chart.destroy();
}

chart=
new Chart(ctx,{

type:"line",

data:{

labels:
records.map(r=>r.date),

datasets:[{

label:"每日產量",

data:
records.map(r=>r.quantity),

borderWidth:3,

fill:false

}]
}

});
}

renderTable();
updateDashboard();
updateChart();