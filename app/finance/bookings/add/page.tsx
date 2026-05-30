"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddBooking() {
  const [form, setForm] = useState({
    property: "",
    guest_name: "",
    invoice_number: "",
    booking_date: new Date().toISOString().split("T")[0],
    checkout_date: "",
    source_type: "",

    gross_amount: "",
    commission_amount: "",
    gst_on_commission: "",
    tds: "",
    tcs: "",
    gst_amount: 0,

    net_amount: 0,
    base_amount: 0,
  });

  const router = useRouter();

  const [editId, setEditId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [userProperty, setUserProperty] = useState("");
  const [oldBooking, setOldBooking] = useState<any>(null);
  const [invoiceError, setInvoiceError] = useState("");

  useEffect(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setEditId(id);
  }
}, []);

  const fetchBooking = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", editId)
    .single();

  if (!error && data) {
setOldBooking(
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
"/finance/bookings"
);

return;

}

    const gross = Number(data.gross_amount || 0);
    const gst = gross > 0 ? (gross * 5) / 105 : 0;

    setForm({
      property: data.property || "",
      guest_name: data.guest_name || "",
      invoice_number: data.invoice_number || "",
      booking_date: data.booking_date || "",
      checkout_date: data.checkout_date || "",
      source_type: data.source_type || "",

      gross_amount: data.gross_amount?.toString() || "",
      commission_amount: data.commission_amount?.toString() || "",
      gst_on_commission: data.gst_on_commission?.toString() || "",
      tds: data.tds?.toString() || "",
      tcs: data.tcs?.toString() || "",
      gst_amount: Number(gst.toFixed(2)),

      net_amount: data.net_amount || 0,
      base_amount: Number((gross - gst).toFixed(2)),
    });
  }
};
 
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
"booking_add"

&&

nav !==
"booking_edit"

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
"/finance/bookings"
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

fetchBooking();

},[
editId,
authenticated,
role,
userProperty
]);

const checkInvoice =
async()=>{

const invoice =
form.invoice_number
.trim();

if(
invoice === ""
){

setInvoiceError("");

return;

}

let query =
supabase
.from(
"bookings"
)
.select(
"id"
)
.eq(
"invoice_number",
invoice
);

if(
editId
){

query =
query.neq(
"id",
editId
);

}

const {
data
}
=
await query;

if(
data
&&
data.length > 0
){

setInvoiceError(
"Invoice number already exists"
);

}
else{

setInvoiceError("");

}

};

  const handleChange = (e: any) => {
    const { name, value } = e.target;
if(
name === "invoice_number"
){

setInvoiceError("");

}

    const updated = { ...form, [name]: value };

    const gross = Number(updated.gross_amount || 0);
    const commission = Number(updated.commission_amount || 0);
    const gst_comm = Number(updated.gst_on_commission || 0);
    const tds = Number(updated.tds || 0);
    const tcs = Number(updated.tcs || 0);

    
    // NET CALCULATION
    updated.net_amount =
      gross - commission - gst_comm - tds - tcs;

    // GST CALCULATION ONLY WHEN GROSS CHANGES
    if (name === "gross_amount") {
       if (gross > 0) {
         const gst = (gross * 5) / 105;
         updated.gst_amount = Number(gst.toFixed(2));
         updated.base_amount = Number((gross - gst).toFixed(2));
     } else {
       updated.gst_amount = 0;
       updated.base_amount = 0;
     }
    }

    setForm(updated);
  };

const handleSubmit = async () => {
  if (!form.guest_name || !form.property || !form.gross_amount) {
    alert("Please fill Guest Name, Property, and Gross Amount");
    return;
  }

if(
invoiceError
){

alert(
"Please fix duplicate invoice number"
);

return;

}


  const payload = {
    property: form.property,
    guest_name: form.guest_name,
    invoice_number: form.invoice_number,
    booking_date: form.booking_date,
    checkout_date: form.checkout_date,
    source_type: form.source_type,

    gross_amount: Number(form.gross_amount || 0),
    commission_amount: Number(form.commission_amount || 0),
    gst_on_commission: Number(form.gst_on_commission || 0),
    tds: Number(form.tds || 0),
    tcs: Number(form.tcs || 0),
    gst_amount: Number(form.gst_amount || 0),
    net_amount: Number(form.net_amount || 0),
  };

  let error;

  if (editId) {
    const res = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", editId);

    error = res.error;
  } else {
    const res = await supabase
      .from("bookings")
      .insert([payload]);

    error = res.error;
  }

  if (error) {
    alert(error.message);
  } else {
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
"bookings",

record_id:
editId || "",

old_data:
editId
?
oldBooking
:
null,

new_data:
payload

}]);

    alert(editId ? "Updated successfully" : "Saved successfully");

sessionStorage.removeItem(
"finance_nav"
);
  
router.push(
"/finance/bookings"
);
  }
};

if(
!authenticated
){

return null;

}

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">
        {editId ? "Edit Booking" : "Add Booking"}
      </h2>

      {/* BASIC */}
      <div className="space-y-2">
        <input
          name="guest_name"
          value={form.guest_name}
          placeholder="Guest Name *"
          onChange={handleChange}
          className="input"
        />

        <input
          name="invoice_number"
          value={form.invoice_number}
          placeholder="Invoice Number"
          onChange={handleChange}
          onBlur={checkInvoice}
          className="input"
        />

{
invoiceError
&&

<p className="
text-red-500
text-sm
">
⚠ {invoiceError}
</p>

}

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

          className="input">

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

          <option>
          {userProperty}
          </option>

          :

          <>

          <option>
          Mahas Elite
          </option>

          <option>
          Mahas Vrindavan
          </option>

          </>

          }

        </select>
      </div>

      {/* DATES */}
      <div className="space-y-2">
        <input
          type="date"
          name="booking_date"
          value={form.booking_date}
          onChange={handleChange}
          className="input"
        />

        <input
          type="date"
          name="checkout_date"
          value={form.checkout_date}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* SOURCE */}
      <select name="source_type" 
        value={form.source_type}
        onChange={handleChange} className="input">
        <option value="">Select Source</option>
        <option>Direct</option>
        <option>Airbnb</option>
        <option>MakeMyTrip</option>
        <option>Goibibo</option>
        <option>Agoda</option>
        <option>Booking.com</option>
        <option>StayFlexi</option>
      </select>

      {/* AMOUNTS */}
      <div className="space-y-2">
        <input
          name="gross_amount"
          value={form.gross_amount}
          placeholder="Gross Amount (₹) *"
          onChange={handleChange}
          className="input"
        />

        <input
          name="commission_amount"
          value={form.commission_amount}
          placeholder="Commission (₹)"
          onChange={handleChange}
          className="input"
        />

        <input
          name="gst_on_commission"
          value={form.gst_on_commission}
          placeholder="GST on Commission (₹)"
          onChange={handleChange}
          className="input"
        />

        <input
          name="tds"
          value={form.tds}
          placeholder="TDS (₹)"
          onChange={handleChange}
          className="input"
        />

        <input
          name="tcs"
          value={form.tcs}
          placeholder="TCS (₹)"
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* CALCULATION BOX */}
      <div className="bg-gray-100 p-3 rounded space-y-1">
        <p className="text-sm text-gray-600">
          Gross: ₹{form.gross_amount || 0}
        </p>
        <p className="text-sm text-gray-600">
          Commission: ₹{form.commission_amount || 0}
        </p>
        <p className="text-sm text-gray-600">
          GST on Commission: ₹{form.gst_on_commission || 0}
        </p>
        <p className="text-sm text-gray-600">
          TDS: ₹{form.tds || 0}
        </p>
        <p className="text-sm text-gray-600">
          TCS: ₹{form.tcs || 0}
        </p>

        <hr />

        <p className="font-medium">Base Revenue: ₹{form.base_amount || 0}</p>
        <p className="font-medium">GST (5%): ₹{form.gst_amount || 0}</p>

        <hr />

        <p className="font-bold">
         Net (After deductions): ₹{form.net_amount}
        </p>

      </div>

      {/* SUBMIT */}
      <div className="space-y-2">
  <button
    onClick={handleSubmit}
    className="bg-black text-white p-3 rounded w-full"
  >
    {editId ? "Update Booking" : "Save Booking"}
  </button>

  {editId && (
    <button
      onClick={() => router.push("/finance/bookings")}
      className="border border-gray-400 p-3 rounded w-full"
    >
      Cancel
    </button>
  )}
</div>
    </div>
  );
}