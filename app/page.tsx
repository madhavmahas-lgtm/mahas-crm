'use client';

import { supabase } from "@/lib/supabase";
import { useState, useEffect, useMemo } from "react";

export default function Home() {

const [enquiries, setEnquiries] = useState<any[]>([]);

const empty = {
name: "", phone: "", email: "",
checkInDate: "", checkOutDate: "",
guestsAbove5: "", guestsBelow5: "",
property: "Mahas Elite",
flats: "1",
flatsElite: "", flatsVrindavan: "",
discount: "", discountElite: "", discountVrindavan: "",
status: "New"
};

const [form, setForm] = useState<any>(empty);

useEffect(() => {
fetchData();
}, []);

const fetchData = async () => {
const { data } = await supabase
.from("enquiries")
.select("*")
.order("id", { ascending: false });

setEnquiries(data || []);
};

const nights = useMemo(() => {
if (!form.checkInDate || !form.checkOutDate) return 0;
return Math.max(0,
(new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime())
/ (1000 * 60 * 60 * 24)
);
}, [form.checkInDate, form.checkOutDate]);

const handleChange = (e:any) => {
const { name, value } = e.target;
setForm({ ...form, [name]: value });
};

const save = async () => {
if (!form.name || !form.phone || !form.checkInDate || !form.checkOutDate) {
alert("Fill all required fields");
return;
}

const { error } = await supabase
.from("enquiries")
.insert([{
name: form.name,
phone: form.phone,
email: form.email || null,
checkInDate: form.checkInDate,
checkOutDate: form.checkOutDate,
guestsAbove5: Number(form.guestsAbove5 || 0),
guestsBelow5: form.guestsBelow5 ? Number(form.guestsBelow5) : null,

property: form.property,

flats: form.flats ? Number(form.flats) : null,
flatsElite: form.flatsElite ? Number(form.flatsElite) : null,
flatsVrindavan: form.flatsVrindavan ? Number(form.flatsVrindavan) : null,

discount: form.discount ? Number(form.discount) : null,
discountElite: form.discountElite ? Number(form.discountElite) : null,
discountVrindavan: form.discountVrindavan ? Number(form.discountVrindavan) : null,

status: "New"
}]);

if (error) {
console.error("SUPABASE ERROR:", error);
alert(error.message);
return;
}

fetchData();
setForm(empty);
};

const calculatePrice = () => {
const g = Number(form.guestsAbove5 || 0);
const nightsNum = Number(nights || 0);

// BOTH
if (form.property === "Both") {
const flatsElite = Number(form.flatsElite || 1);
const flatsVr = Number(form.flatsVrindavan || 1);

const eliteBase = 3000 * nightsNum * flatsElite;
const eliteExtra = Math.max(0, g - (4 * flatsElite)) * 500 * nightsNum;
const eliteTotal = eliteBase + eliteExtra - Number(form.discountElite || 0);

const vrBase = 6000 * nightsNum * flatsVr;
const vrExtra = Math.max(0, g - (6 * flatsVr)) * 500 * nightsNum;
const vrTotal = vrBase + vrExtra - Number(form.discountVrindavan || 0);

return "Elite ₹" + eliteTotal + " / Vrindavan ₹" + vrTotal;
}

// SINGLE
const flats = Number(form.flats || 1);
const baseRate = form.property === "Mahas Elite" ? 3000 : 6000;
const included = form.property === "Mahas Elite" ? 4 : 6;

const extraGuests = Math.max(0, g - (included * flats));
const extraCost = extraGuests * 500 * nightsNum;

const baseCost = baseRate * nightsNum * flats;
const total = baseCost + extraCost - Number(form.discount || 0);

return "₹" + total;
};

const sendQuote = (i:number) => {

const e = enquiries[i];

const formatDate = (d:any) => {
const dt = new Date(d);
const day = String(dt.getDate()).padStart(2,'0');
const month = dt.toLocaleString('en-IN',{month:'short'});
const year = dt.getFullYear();
return day + "-" + month + "-" + year;
};

const days = Math.max(0,
(new Date(e.checkOutDate).getTime() - new Date(e.checkInDate).getTime())
/ (1000 * 60 * 60 * 24)
);

const g = Number(e.guestsAbove5 || 0);

let eliteTotal = 0;
let vrTotal = 0;
let total = 0;

let message = `*Mahas Homestays*

Property: ${e.property}

Hi ${e.name} 👋

📅 Check-in: ${formatDate(e.checkInDate)} (12:00 PM onwards)
📅 Check-out: ${formatDate(e.checkOutDate)} (before 11:00 AM)
🗓 Days: ${days}

👨‍👩‍👧 Guests (>5yrs): ${e.guestsAbove5}
👶 Guests (≤5yrs): ${e.guestsBelow5 || 0}

`;

if (e.property === "Both") {

const flatsElite = Number(e.flatsElite || 1);
const flatsVr = Number(e.flatsVrindavan || 1);

const eliteExtraGuests = Math.max(0, g - (4 * flatsElite));
const vrExtraGuests = Math.max(0, g - (6 * flatsVr));

const eliteExtraCost = eliteExtraGuests * 500 * days;
const vrExtraCost = vrExtraGuests * 500 * days;

const eliteBase = 3000 * days * flatsElite;
const vrBase = 6000 * days * flatsVr;

const eliteBaseLine = `${days} day(s) x ${flatsElite} flat(s) x 3000 = ₹${eliteBase}`;
const vrBaseLine = `${days} day(s) x ${flatsVr} flat(s) x 6000 = ₹${vrBase}`;

eliteTotal = eliteBase + eliteExtraCost - Number(e.discountElite || 0);
vrTotal = vrBase + vrExtraCost - Number(e.discountVrindavan || 0);

message += `🏠 *Mahas Elite*
Flats: ${flatsElite}
Price: ${eliteBaseLine}
Extra Guest(s): ${days} day(s) x ${eliteExtraGuests} Guest(s) x ₹500 = ₹${eliteExtraCost}
${Number(e.discountElite || 0) > 0 ? `Discount: ₹${e.discountElite}\n` : ""}Total: ₹${eliteTotal}
Electricity: 20 units/day free, Extra unit ₹15

🏠 *Mahas Vrindavan*
Flats: ${flatsVr}
Price: ${vrBaseLine}
Extra Guest(s): ${days} day(s) x ${vrExtraGuests} Guest(s) x ₹500 = ₹${vrExtraCost}
${Number(e.discountVrindavan || 0) > 0 ? `Discount: ₹${e.discountVrindavan}\n` : ""}Total: ₹${vrTotal}
Electricity: 30 units/day free, Extra unit ₹15

`;

} else {

const flats = Number(e.flats || 1);
const baseRate = e.property === "Mahas Elite" ? 3000 : 6000;
const included = e.property === "Mahas Elite" ? 4 : 6;

const extraGuests = Math.max(0, g - (included * flats));
const extraCost = extraGuests * 500 * days;

const baseCost = baseRate * days * flats;
const baseLine = `${days} day(s) x ${flats} flat(s) x ${baseRate} = ₹${baseCost}`;

total = baseCost + extraCost - Number(e.discount || 0);

message += `🏠 *${e.property}*
Flats: ${flats}
Price: ${baseLine}
Extra Guest(s): ${days} day(s) x ${extraGuests} Guest(s) x ₹500 = ₹${extraCost}
${Number(e.discount || 0) > 0 ? `Discount: ₹${e.discount}\n` : ""}Total: ₹${total}
Electricity: ${e.property === "Mahas Elite"
? "20 units/day free, Extra unit ₹15"
: "30 units/day free, Extra unit ₹15"}

`;
}

let finalAmount = "";

if (e.property === "Both") {
finalAmount = `Elite ₹${eliteTotal} / Vrindavan ₹${vrTotal}`;
} else {
finalAmount = `₹${total}`;
}

message += `\n💰 Final Amount: ${finalAmount}\n`;
message += `\n\nPlease confirm booking to proceed 🙏`;

window.open(`https://wa.me/91${e.phone}?text=${encodeURIComponent(message)}`);
};

return (

<div className="p-4 max-w-md mx-auto">

<h1 className="text-xl font-bold mb-3 text-center">
Mahas Enquiry CRM
</h1>

<input name="name" placeholder="Name"
value={form.name} onChange={handleChange}
className="w-full border p-2 mb-2" />

<input name="phone" placeholder="Phone"
value={form.phone} onChange={handleChange}
className="w-full border p-2 mb-2" />

<select name="property"
value={form.property} onChange={handleChange}
className="w-full border p-2 mb-2">

<option value="Mahas Elite">Mahas Elite</option>
<option value="Mahas Vrindavan">Mahas Vrindavan</option>
<option value="Both">Both</option>
</select>

<input type="date" name="checkInDate"
value={form.checkInDate} onChange={handleChange}
className="w-full border p-2 mb-2" />

<input type="date" name="checkOutDate"
value={form.checkOutDate} onChange={handleChange}
className="w-full border p-2 mb-2" />

<input name="guestsAbove5" placeholder="Guests >5"
value={form.guestsAbove5} onChange={handleChange}
className="w-full border p-2 mb-2" />

<input name="guestsBelow5" placeholder="Guests <=5 (optional)"
value={form.guestsBelow5} onChange={handleChange}
className="w-full border p-2 mb-2" />

{form.property !== "Both" && (
<> <input name="flats" placeholder="Flats"
value={form.flats} onChange={handleChange}
className="w-full border p-2 mb-2" />

<input name="discount" placeholder="Discount"
value={form.discount} onChange={handleChange}
className="w-full border p-2 mb-2" />
</>
)}

{form.property === "Both" && (
<>
<input name="flatsElite" placeholder="Elite Flats"
value={form.flatsElite || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />

<input name="flatsVrindavan" placeholder="Vrindavan Flats"
value={form.flatsVrindavan || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />

<input name="discountElite" placeholder="Elite Discount"
value={form.discountElite || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />

<input name="discountVrindavan" placeholder="Vrindavan Discount"
value={form.discountVrindavan || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />
</>
)}

<div className="bg-gray-100 p-2 mb-2">
Nights: {nights} <br />
Price: {calculatePrice()}
</div>

<button onClick={save}
className="bg-green-500 text-white w-full p-2 mb-3">
Save Enquiry </button>

{enquiries.map((e,i)=>(

<div key={i} className="border p-2 mb-2">
{e.name} - {e.phone}
<button
onClick={()=>sendQuote(i)}
className="block w-full bg-blue-500 text-white mt-2">
Send Quote
</button>
</div>
))}

</div>
);
}
