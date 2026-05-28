"use client";

import {
useEffect,
useState
}
from "react";

import {
supabase
}
from "@/lib/supabase";

export default function PettyCashPage(){

const [
entries,
setEntries
] = useState<any[]>([]);

const [
summary,
setSummary
] = useState<any[]>([]);

const [form,setForm] =
useState({

date:
new Date()
.toISOString()
.split("T")[0],

property:"",
manager_name:"",
amount:"",
notes:""

});

const fetchEntries =
async()=>{

const {
data
}
=
await supabase
.from(
"petty_cash"
)
.select("*")
.order(
"date",
{
ascending:false
}
);

setEntries(
data || []
);

};

const loadSummary =
async()=>{

const {
data: petty
}
=
await supabase
.from(
"petty_cash"
)
.select("*");

const {
data: expenses
}
=
await supabase
.from(
"expenses"
)
.select("*")
.eq(
"payment_mode",
"Cash"
);

const properties = [

"Mahas Elite",
"Mahas Vrindavan"

];

const rows =
properties.map(
(property)=>{

const given =
(petty || [])
.filter(
(p:any)=>
p.property === property
)
.reduce(
(
a:number,
p:any
)=>

a +

Number(
p.amount || 0
)

,0
);

const spent =
(expenses || [])
.filter(
(e:any)=>
e.property === property
)
.reduce(
(
a:number,
e:any
)=>

a +

Number(
e.net_amount
||
e.gross_amount
||
0
)

,0
);

return{

property,

given,

spent,

balance:
given - spent

};

}
);

setSummary(rows);

};

useEffect(()=>{

fetchEntries();

loadSummary();

},[]);

const handleChange =
(e:any)=>{

setForm({

...form,

[e.target.name]:
e.target.value

});

};

const handleSave =
async()=>{

const created_by =
sessionStorage.getItem(
"finance_user"
)
||
"unknown";

const payload = {

...form,

amount:
Number(
form.amount || 0
),

created_by

};

const { error } =
await supabase
.from(
"petty_cash"
)
.insert([
payload
]);

if(error){

alert(
error.message
);

return;

}

alert(
"Petty cash added"
);

setForm({

date:
new Date()
.toISOString()
.split("T")[0],

property:"",
manager_name:"",
amount:"",
notes:""

});

fetchEntries();
loadSummary();

};

return(

<div className="
container
space-y-4
">

<h1 className="
text-2xl
font-bold
">
Petty Cash
</h1>

<div className="
grid
grid-cols-2
gap-2
">

<input
type="date"
name="date"
value={form.date}
onChange={handleChange}
className="input"
/>

<select
name="property"
value={form.property}
onChange={handleChange}
className="input"
>

<option value="">
Select Property
</option>

<option>
Mahas Elite
</option>

<option>
Mahas Vrindavan
</option>

</select>

<input
name="manager_name"
value={form.manager_name}
placeholder="Manager Name"
onChange={handleChange}
className="
input
col-span-2
"
/>

<input
name="amount"
value={form.amount}
placeholder="Amount"
onChange={handleChange}
className="
input
col-span-2
"
/>

<textarea
name="notes"
value={form.notes}
placeholder="Notes"
onChange={handleChange}
className="
input
col-span-2
"
/>

<button
onClick={handleSave}
className="
bg-black
text-white
p-2
rounded
col-span-2
"
>

Save

</button>

</div>

<div className="
border
rounded
p-4
bg-white
">

<h2 className="
font-bold
mb-3
">
Petty Cash Summary
</h2>

<table className="
w-full
text-sm
">

<thead>

<tr className="
border-b
font-bold
">

<td>
Property
</td>

<td className="
text-right
">
Given
</td>

<td className="
text-right
">
Spent
</td>

<td className="
text-right
">
Balance
</td>

</tr>

</thead>

<tbody>

{
summary.map((s:any)=>(
<tr
key={s.property}
className="
border-b
"
>

<td>
{s.property}
</td>

<td className="
text-right
">
₹{
Number(
s.given || 0
)
.toLocaleString(
"en-IN"
)
}
</td>

<td className="
text-right
">
₹{
Number(
s.spent || 0
)
.toLocaleString(
"en-IN"
)
}
</td>

<td className="
text-right
font-bold
">
₹{
Number(
s.balance || 0
)
.toLocaleString(
"en-IN"
)
}
</td>

</tr>
))
}

</tbody>

</table>

</div>

<div className="
space-y-2
">

{
entries.map((e)=>(
<div
key={e.id}
className="
border
rounded
p-3
bg-white
"
>

<p className="
font-bold
">

₹{
Number(
e.amount || 0
)
.toLocaleString(
"en-IN"
)
}

</p>

<p>
{e.property}
</p>

<p>
{e.manager_name}
</p>

<p className="
text-sm
text-gray-500
">
{e.date}
</p>

{
e.notes
&&
<p className="
text-sm
">
{e.notes}
</p>
}

</div>
))
}

</div>

</div>

);

}