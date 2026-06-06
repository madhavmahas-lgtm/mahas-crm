"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// GET ID
export default function AddExpense() {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [userProperty, setUserProperty] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [oldExpense, setOldExpense] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      setEditId(id);
    }
  }, []);  


  const [form, setForm] = useState({
  date: new Date().toISOString().split("T")[0],
  property: "",
  category: "",
  paid_to: "",
  payment_mode: "",

  net_amount: "",
  gst_amount: "",
  gross_amount: "",

  supplier_invoice: "",
  supplier_gst: "",
  notes: "",
  elite_share: "",
  vrindavan_share: "",

});

  const handleChange = (e:any) => {

const {
name,
value
} = e.target;

let updatedForm = {

...form,

[name]: value

};

const gross =

Number(
name === "net_amount"
? value
: updatedForm.net_amount
|| 0
)

+

Number(
name === "gst_amount"
? value
: updatedForm.gst_amount
|| 0
);

if(
updatedForm.property
===
"Mahas Elite"
){

updatedForm.elite_share =
gross.toString();

updatedForm.vrindavan_share =
"0";

}

else if(
updatedForm.property
===
"Mahas Vrindavan"
){

updatedForm.elite_share =
"0";

updatedForm.vrindavan_share =
gross.toString();

}

else if(
updatedForm.property
===
"Common"
){

if(
name === "property"
||

name === "net_amount"
||

name === "gst_amount"
){

const elite =

(
gross / 3
)
.toFixed(2);

updatedForm.elite_share =
elite;

updatedForm.vrindavan_share =
(
gross
-
Number(elite)
)
.toFixed(2);

}

}

setForm(
updatedForm
);

};

  const fetchExpense = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", editId as string)
      .single();

    if (!error && data) {
setOldExpense(
data
);
if(
role !== "admin"
&&
userProperty
&&
data.property
!== userProperty
){

alert(
"Access denied"
);

sessionStorage.removeItem(
"finance_nav"
);

router.push(
"/finance/expenses"
);

return;

}
      setForm({
        date: data.date || "",
        property: data.property || "",
        category: data.category || "",
        paid_to: data.paid_to || "",
        payment_mode: data.payment_mode ||"Bank Transfer",

        net_amount: data.net_amount?.toString() || "",
        gst_amount: data.gst_amount?.toString() || "",
        gross_amount: data.gross_amount?.toString() || "",

        supplier_invoice: data.supplier_invoice || "",
        supplier_gst: data.supplier_gst || "",
        notes: data.notes || "",
        elite_share: data.elite_share?.toString() || "",
        vrindavan_share: data.vrindavan_share?.toString() || "",
      });
    }
  };

// FETCH DATA

useEffect(()=>{

const auth =
sessionStorage.getItem(
"finance_auth"
);

const nav =
sessionStorage.getItem(
"finance_nav"
);

const currentRole =
sessionStorage.getItem(
"finance_role"
)
||"";

const currentProperty =
sessionStorage.getItem(
"finance_property"
)
||"";

if(
auth !== "true"
){

router.push(
"/finance"
);

return;

}

if(
nav !==
"expense_add"

&&

nav !==
"expense_edit"

){

router.push(
"/finance"
);

return;

}

if(
currentRole ===
"viewer"
){

sessionStorage.removeItem(
"finance_nav"
);

router.push(
"/finance/expenses"
);

return;

}

setAuthenticated(
true
);

setRole(
currentRole
);

setUserProperty(
currentProperty
);

},[]);

useEffect(()=>{

if(
userProperty
&&
!editId
){

setForm(
(prev)=>({

...prev,

property:
userProperty

})

);

}

},[
userProperty,
editId
]);

useEffect(()=>{

if(
!editId
){

return;

}

if(
!authenticated
){

return;

}

if(
role !== "admin"
&&
!userProperty
){

return;

}

fetchExpense();

},[
editId,
authenticated,
role,
userProperty
]);


  const handleSubmit = async () => {
    if (!form.date || !form.property || !form.category || !form.net_amount) {
      alert("Fill required fields");
      return;
    }

const grossAmount =

Number(
form.net_amount || 0
)

+

Number(
form.gst_amount || 0
);

if(
form.property === "Common"
){

const totalAllocated =

Number(
form.elite_share || 0
)

+

Number(
form.vrindavan_share || 0
);

if(
Math.abs(
grossAmount -
totalAllocated
) > 0.01
){

alert(
"Allocation mismatch. Elite Share + Vrindavan Share must equal Gross Amount."
);

return;

}

}

const payload = {

date:
form.date,

property:
form.property,

category:
form.category,

paid_to:
form.paid_to,

payment_mode:
form.payment_mode,

net_amount:
Number(
form.net_amount || 0
),

gst_amount:
Number(
form.gst_amount || 0
),

gross_amount:
Number(
form.net_amount || 0
)
+
Number(
form.gst_amount || 0
),

supplier_invoice:
form.supplier_invoice,

supplier_gst:
form.supplier_gst,

notes:
form.notes,

elite_share:
Number(
form.elite_share || 0
),

vrindavan_share:
Number(
form.vrindavan_share || 0
)
};

    let error;

    if (editId) {
      const res = await supabase
        .from("expenses")
        .update(
        payload
        )
        .eq("id", editId);

      error = res.error;
    } else {
      const res = await supabase.from("expenses")
        .insert([
        payload
        ]);

      error = res.error;
    }

    if (error) {
      alert(error.message);
    } 
      else {

const username =
sessionStorage.getItem(
"finance_user"
)
||
"unknown";

await supabase
.from(
"finance_audit"
)
.insert([{

username,

action:
editId
?
"UPDATE"
:
"CREATE",

module:
"expenses",

record_id:
editId || "",

old_data:
editId
?
oldExpense
:
null,

new_data:
payload

}]);

alert(
editId
?
"Updated successfully"
:
"Expense added"
);
sessionStorage.removeItem(
"finance_nav"
);

      router.push("/finance/expenses");
    }
  };

if(
!authenticated
){

return null;

}
      
  return (
    <div className="p-4 max-w-xl mx-auto space-y-3">
      <h2 className="text-xl font-bold">
        {editId ? "Edit Expense" : "Add Expense"}
      </h2>

      {/* DATE */}
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="input"
      />

      {/* PROPERTY */}

<select

name="property"

value={
userProperty
||
form.property
}

onChange={(e)=>{

if(
!userProperty
){

handleChange(
e
);

}

}}

className="input"

>

{
!userProperty

&&

<option value="">
Select Property *
</option>

}

{
userProperty

?

<>

<option>
{userProperty}
</option>

<option>
Common
</option>

</>

:

<>

<option>
Mahas Elite
</option>

<option>
Mahas Vrindavan
</option>

<option>
Common
</option>

</>

}

</select>

      {/* CATEGORY */}
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="input"
      >
        <option value="">Select Category *</option>
        <option>Rent</option>
        <option>Salary</option>
        <option>Electricity</option>
        <option>Housekeeping</option>
        <option>Maintenance</option>
        <option>OTA Charges</option>
        <option>Payment Charges</option>
        <option>Card/UPI Charges</option>
        <option>Staff Expenses</option>
        <option>Business Travel</option>
        <option>GST Payment</option>
        <option>TDS Payment</option>
        <option>Loan Repay</option>
        <option>Marketing Charges</option>
        <option>Accountant Charges</option>
        <option>Misc</option>
      </select>

      {/* PAID TO */}
      <input
        name="paid_to"
        value={form.paid_to}
        placeholder="Paid To (Supplier / Person)"
        onChange={handleChange}
        className="input"
      />

<select
name="payment_mode"
value={form.payment_mode}
onChange={handleChange}
className="input"
>

<option value="">
Payment Mode
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

      {/* AMOUNTS */}
      <input
        name="net_amount"
        value={form.net_amount}
        placeholder="Net Amount (₹) *"
        onChange={handleChange}
        className="input"
      />

      <input
        name="gst_amount"
        value={form.gst_amount}
        placeholder="GST Amount (₹)"
        onChange={handleChange}
        className="input"
      />

      <input
       value={
         (
           Number(form.net_amount || 0)
           +
           Number(form.gst_amount || 0)
         ).toString()
       }
       placeholder="Gross Amount (Auto)"
       readOnly
       className="input bg-gray-100"
      />

{
form.property === "Common"
&&
<>

<input
name="elite_share"
value={form.elite_share}
placeholder="Elite Share"
onChange={handleChange}
className="input"
/>

<input
name="vrindavan_share"
value={form.vrindavan_share}
placeholder="Vrindavan Share"
onChange={handleChange}
className="input"
/>

</>
}

      {/* EXTRA */}
      <input
        name="supplier_invoice"
        value={form.supplier_invoice}
        placeholder="Supplier Invoice (optional)"
        onChange={handleChange}
        className="input"
      />

      <input
        name="supplier_gst"
        value={form.supplier_gst}
        placeholder="Supplier GST (optional)"
        onChange={handleChange}
        className="input"
      />

      <textarea
        name="notes"
        value={form.notes}
        placeholder="Notes"
        onChange={handleChange}
        className="input"
      />

      <button
        onClick={handleSubmit}
        className="bg-black text-white p-3 rounded w-full"
      >
        {editId ? "Update Expense" : "Save Expense"}
      </button>
    </div>
  );
}