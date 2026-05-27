"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuditPage(){

const [logs,setLogs] =
useState<any[]>([]);

const [expanded,
setExpanded] =
useState("");

const [fromDate,
setFromDate] =
useState("");

const [toDate,
setToDate] =
useState("");

const [userFilter,
setUserFilter] =
useState("");

const [moduleFilter,
setModuleFilter] =
useState("");

const fetchLogs =
async()=>{

let query =
supabase
.from(
"finance_audit"
)
.select("*");

if(
fromDate
){

query =
query.gte(
"created_at",
fromDate + "T00:00:00"
);

}

if(
toDate
){

query =
query.lte(
"created_at",
toDate + "T23:59:59"
);

}

if(
userFilter
){

query =
query.eq(
"username",
userFilter
);

}

if(
moduleFilter
){

query =
query.eq(
"module",
moduleFilter
);

}

const {
data,
error
}
=
await query
.order(
"created_at",
{
ascending:false
}
);

if(
!error
){

setLogs(
data || []
);

}

};

useEffect(()=>{

fetchLogs();

},[
fromDate || "",
toDate || "",
userFilter || "",
moduleFilter || ""
]);

return(

<div className="
p-4
space-y-3
">

<h2 className="
text-xl
font-bold
">

Finance Audit

</h2>

<div className="
grid
grid-cols-2
gap-2
">

<input
type="date"
value={fromDate}
onChange={(e)=>
setFromDate(
e.target.value
)
}
className="
border
p-2
rounded
"
/>

<input
type="date"
value={toDate}
onChange={(e)=>
setToDate(
e.target.value
)
}
className="
border
p-2
rounded
"
/>

<input
placeholder="User"
value={userFilter}
onChange={(e)=>
setUserFilter(
e.target.value
)
}
className="
border
p-2
rounded
"
/>

<select
value={moduleFilter}
onChange={(e)=>
setModuleFilter(
e.target.value
)
}
className="
border
p-2
rounded
"
>

<option value="">
All Modules
</option>

<option>
bookings
</option>

<option>
expenses
</option>

</select>

</div>

{

logs.map(
(log)=>(

<div
key={log.id}
className="
border
rounded
p-3
bg-white
shadow-sm
space-y-2
"
>

<div className="
grid
grid-cols-2
md:grid-cols-4
gap-2
text-sm
"
>

<div>

<p className="
text-gray-500
">
Date
</p>

<p>

{
new Date(
log.created_at
)
.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="
text-gray-500
">
User
</p>

<p>
{log.username}
</p>

</div>

<div>

<p className="
text-gray-500
">
Module
</p>

<p>
{log.module}
</p>

</div>

<div>

<p className="
text-gray-500
">
Action
</p>

<p>
{log.action}
</p>

</div>

</div>

<button
onClick={()=>

setExpanded(

expanded === log.id
? ""
: log.id

)

}
className="
text-blue-600
text-sm
"
>

View Details

</button>

{

expanded === log.id

&&

<div className="
grid
grid-cols-1
md:grid-cols-2
gap-3
text-xs
"
>

<div>

<p className="
font-bold
mb-2
">

Old Data

</p>

<pre>

{
JSON.stringify(
log.old_data,
null,
2
)
}

</pre>

</div>

<div>

<p className="
font-bold
mb-2
">

New Data

</p>

<pre>

{
JSON.stringify(
log.new_data,
null,
2
)
}

</pre>

</div>

</div>

}

</div>

))

}

</div>

);

}