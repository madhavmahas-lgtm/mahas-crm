"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<any[]>([]);

const currentMonth =
new Date()
.toISOString()
.slice(0,7);

const [fromDate,
setFromDate] =
useState(
`${currentMonth}-01`
);

const nextMonth =
new Date(
currentMonth + "-01"
);

nextMonth.setMonth(
nextMonth.getMonth()+1
);

const [toDate,
setToDate] =
useState(
nextMonth
.toISOString()
.split("T")[0]
);

const [
propertyFilter,
setPropertyFilter
] = useState("");

const [
paymentModeFilter,
setPaymentModeFilter
] = useState("");

  const router = useRouter();
  const [role, setRole] = useState("");

  const fetchExpenses =
async()=>{

let query =
supabase
.from(
"expenses"
)
.select("*");

if(
fromDate
){

query =
query.gte(
"date",
fromDate
);

}

if(
toDate
){

query =
query.lte(
"date",
toDate
);

}

if(
propertyFilter
){

query =
query.eq(
"property",
propertyFilter
);

}

if(
paymentModeFilter
){

query =
query.eq(
"payment_mode",
paymentModeFilter
);

}

const {
data,
error
} = await query
.order(
"date",
{
ascending:false
}
);

if(
!error
){

setExpenses(
data || []
);

}

};

useEffect(()=>{

setRole(
sessionStorage.getItem(
"finance_role"
)
||""

);

},[]);

useEffect(()=>{
fetchExpenses();
},[
fromDate,
toDate,
propertyFilter,
paymentModeFilter
]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this expense?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      fetchExpenses();
    }
  };

  return (
    <div className="container space-y-4">
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Expenses</h2>
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

<select
value={
propertyFilter
}
onChange={(e)=>
setPropertyFilter(
e.target.value
)
}
className="
border
p-2
rounded
col-span-2
"
>

<option value="">
All Properties
</option>

<option>
Mahas Elite
</option>

<option>
Mahas Vrindavan
</option>

<option>
Common
</option>

</select>

<select
value={
paymentModeFilter
}
onChange={(e)=>
setPaymentModeFilter(
e.target.value
)
}
className="
border
p-2
rounded
col-span-2
"
>

<option value="">
All Payment Modes
</option>

<option>
Cash
</option>

<option>
Bank Transfer
</option>

<option>
UPI
</option>

<option>
Credit Card
</option>

<option>
Debit Card
</option>

</select>

</div>

        {
role !== "viewer"

&&

<button
onClick={() =>
router.push(
"/finance/expenses/add"
)
}
className="
bg-black
text-white
px-3
py-1
rounded
text-sm
"
>

+ Add

</button>

}
     </div>
      

      {expenses.map((e) => (
        <div
          key={e.id}
          className="border rounded-lg p-3 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition"
        >
          <div>
            <p className="font-bold">
              ₹{Number(e.net_amount || 0).toLocaleString("en-IN")}
            </p>
            <p className="text-sm">{e.category}</p>
            <p className="text-sm text-gray-600">
              {e.property} | {e.date}
            </p>
            {e.paid_to && (
              <p className="text-sm text-gray-500">
                Paid to: {e.paid_to}
              </p>
            )}
{e.payment_mode && (

<p className="
text-sm
text-blue-600
">

Mode:
{
e.payment_mode
}

</p>

)}
          </div>

          <div className="flex items-center gap-3 text-sm">
            {
role !== "viewer"

&&

<button
onClick={() =>
router.push(
`/finance/expenses/add?id=${e.id}`
)
}
className="
text-blue-600
"
>

Edit

</button>

}

            {
role !== "viewer"

&&

<button
onClick={() =>
handleDelete(
e.id
)
}
className="
text-red-600
"
>

Delete

</button>

}
          </div>
        </div>
      ))}
    </div>
  );
}