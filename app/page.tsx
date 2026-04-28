'use client';

/* =========================
SECTION 1: IMPORTS
========================= */
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useMemo } from "react";

/* =========================
SECTION 2: MAIN COMPONENT
========================= */
export default function Home() {

/* =========================
SECTION 3: STATE & DEFAULTS
========================= */
const [activeTab, setActiveTab] = useState("New");

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

/* =========================
SECTION 4: INITIAL LOAD
========================= */
useEffect(() => {
fetchData();
}, []);

/* =========================
SECTION 5: FETCH DATA
========================= */
const fetchData = async () => {
const { data } = await supabase
.from("enquiries")
.select("*")
.order("id", { ascending: false });

setEnquiries(data || []);
};

/* =========================
SECTION 6: CALCULATE NIGHTS
========================= */
const nights = useMemo(() => {
if (!form.checkInDate || !form.checkOutDate) return 0;
return Math.max(0,
(new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime())
/ (1000 * 60 * 60 * 24)
);
}, [form.checkInDate, form.checkOutDate]);

/* =========================
SECTION 7: HANDLE INPUT
========================= */
const handleChange = (e:any) => {
const { name, value } = e.target;
setForm({ ...form, [name]: value });
};

/* =========================
SECTION 8: SAVE ENQUIRY
========================= */
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
console.error(error);
alert(error.message);
return;
}

fetchData();
setForm(empty);
};

/* =========================
SECTION 9: PRICE CALCULATION
========================= */
const calculatePrice = () => {
const g = Number(form.guestsAbove5 || 0);
const nightsNum = Number(nights || 0);

if (form.property === "Both") {

const flatsElite = form.flatsElite ? Number(form.flatsElite) : 1;
const flatsVr = form.flatsVrindavan ? Number(form.flatsVrindavan) : 1;

const eliteBase = 3000 * nightsNum * flatsElite;
const eliteExtra = Math.max(0, g - (4 * flatsElite)) * 500 * nightsNum;

const eliteExtraGuests = Math.max(0, g - (4 * flatsElite));
const eliteDiscount = Number(form.discountElite || 0);
const eliteTotal = eliteBase + eliteExtra - eliteDiscount;

const vrBase = 6000 * nightsNum * flatsVr;
const vrExtra = Math.max(0, g - (6 * flatsVr)) * 500 * nightsNum;
const vrDiscount = Number(form.discountVrindavan || 0);
const vrTotal = vrBase + vrExtra - vrDiscount;

return "Elite ₹" + eliteTotal + " / Vrindavan ₹" + vrTotal;
}

const flats = Number(form.flats || 1);
const baseRate = form.property === "Mahas Elite" ? 3000 : 6000;
const included = form.property === "Mahas Elite" ? 4 : 6;

const baseCost = baseRate * nightsNum * flats;
const extraGuests = Math.max(0, g - (included * flats));

const extraCost = extraGuests * 500 * nightsNum;

const discount = Number(form.discount || 0);

const total = baseCost + extraCost - discount;

return "₹" + total;};

/* =========================
SECTION 10: SEND QUOTE
========================= */
const updateStatus = async (id:number, newStatus:string) => {

  const { error } = await supabase
    .from("enquiries")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    alert("Error updating status");
    return;
  }

  fetchData();
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

  let message = `Hi ${e.name} 👋

📅 Check-in: ${formatDate(e.checkInDate)} (12:00 PM onwards)
📅 Check-out: ${formatDate(e.checkOutDate)} (before 11:00 AM)
🗓 Days: ${days}

👨‍👩‍👧 Guests (>5yrs): ${e.guestsAbove5}
👶 Guests (≤5yrs): ${e.guestsBelow5 || 0}

`;

/* =========================
SECTION 10A: UPDATE STATUS
========================= */
  // ===== PRICE LOGIC =====

  if (e.property === "Both") {

    const flatsElite = e.flatsElite || 1;
    const flatsVr = e.flatsVrindavan || 1;
const eliteExtraGuests = Math.max(0, e.guestsAbove5 - (4 * flatsElite));
const vrExtraGuests = Math.max(0, e.guestsAbove5 - (6 * flatsVr));

    const eliteBase = 3000 * days * flatsElite;
    const eliteExtra = Math.max(0, e.guestsAbove5 - (4 * flatsElite)) * 500 * days;
    const eliteDiscount = e.discountElite || 0;
    const eliteTotal = eliteBase + eliteExtra - eliteDiscount;

    const vrBase = 6000 * days * flatsVr;
    const vrExtra = Math.max(0, e.guestsAbove5 - (6 * flatsVr)) * 500 * days;
    const vrDiscount = e.discountVrindavan || 0;
    const vrTotal = vrBase + vrExtra - vrDiscount;

    message += `🏠 Mahas Elite
Price: ${days} day(s) X ${flatsElite} flat(s) X 3000 = ${eliteBase}
Extra: ${eliteExtraGuests} guest(s) × ${days} day(s) × ₹500 = ₹${eliteExtra}
Discount: ₹${eliteDiscount}
Total: ₹${eliteTotal}

⚡ Electricity: 20 units/day free, Extra ₹15/unit

🏠 Mahas Vrindavan
Price: ${days} day(s) X ${flatsVr} flat(s) X 6000 = ${vrBase}
Extra: ${vrExtraGuests} guest(s) × ${days} day(s) × ₹500 = ₹${vrExtra}
Discount: ₹${vrDiscount}
Total: ₹${vrTotal}

⚡ Electricity: 30 units/day free, Extra ₹15/unit
`;

  } else {

    const flats = e.flats || 1;
    const baseRate = e.property === "Mahas Elite" ? 3000 : 6000;
    const included = e.property === "Mahas Elite" ? 4 : 6;
const extraGuests = Math.max(0, e.guestsAbove5 - (included * flats));
    const base = baseRate * days * flats;
    const extra = Math.max(0, e.guestsAbove5 - (included * flats)) * 500 * days;

    const discount = e.discount || 0;
    const total = base + extra - discount;

    message += `🏠 ${e.property}

Price: ${days} day(s) X ${flats} flat(s) X ${baseRate} = ${base}
Extra: ${extraGuests} guest(s) × ${days} day(s) × ₹500 = ₹${extra}
Discount: ₹${discount}
Total: ₹${total}

⚡ Electricity: ${
      e.property === "Mahas Elite"
        ? "20 units/day free, Extra ₹15/unit"
        : "30 units/day free, Extra ₹15/unit"
    }
`;
  }

  message += `

Please confirm to proceed 🙏`;

  window.open(`https://wa.me/91${e.phone}?text=${encodeURIComponent(message)}`);

  // CRM update
  updateStatus(e.id, "SentQuote");
};
/* =========================
SECTION 11: UI
========================= */
return (

<div
  autoComplete="off"
  className="p-4 max-w-md mx-auto"
>
<h1 className="text-xl font-bold mb-3 text-center">
Mahas Enquiry CRM
</h1>

<div className="flex gap-2 mb-3">

  <button
    onClick={() => setActiveTab("New")}
    className={`px-3 py-1 ${activeTab === "New" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
   New ({enquiries.filter(e => e.status === "New").length})
  </button>

  <button
    onClick={() => setActiveTab("Follow")}
    className={`px-3 py-1 ${activeTab === "Follow" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    Follow-ups ({enquiries.filter(e =>
  ["SentQuote","FollowUp1","FollowUp2"].includes(e.status)
).length})
  </button>

  <button
    onClick={() => setActiveTab("Closed")}
    className={`px-3 py-1 ${activeTab === "Closed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    Closed ({enquiries.filter(e =>
  ["Final","NoResponse"].includes(e.status)
).length})
  </button>

  <button
    onClick={() => setActiveTab("Booked")}
    className={`px-3 py-1 ${activeTab === "Booked" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    Booked ({enquiries.filter(e => e.status === "Booked").length})
  </button>

</div>

{/* ===== FORM START ===== */}

<label className="block text-sm font-medium">Name</label>
<input
  name="name"
  placeholder="Enter name"
  autoComplete="off"
  value={form.name}
  onChange={handleChange}
  className="w-full border p-2 mb-2"
/>

<label className="block text-sm font-medium">Phone</label>
<input
  name="phone"
  placeholder="Enter phone"
  autoComplete="off"
  value={form.phone}
  onChange={handleChange}
  className="w-full border p-2 mb-2"
/>

<label className="block text-sm font-medium">Property</label>
<select
  name="property"
  value={form.property}
  onChange={handleChange}
  className="w-full border p-2 mb-2"
>

<option value="Mahas Elite">Mahas Elite</option>
<option value="Mahas Vrindavan">Mahas Vrindavan</option>
<option value="Both">Both</option>
</select>

<label className="block text-sm font-medium">Check-In Date</label>
<input type="date" name="checkInDate"
autoComplete="off"
value={form.checkInDate} onChange={handleChange}
className="w-full border p-2 mb-2" />

<label className="block text-sm font-medium">Check-Out Date</label>
<input type="date" name="checkOutDate"
autoComplete="off"
value={form.checkOutDate} onChange={handleChange}
className="w-full border p-2 mb-2" />

<label className="block text-sm font-medium">Guests (&gt;5 yrs)</label>
<input name="guestsAbove5" placeholder="Guests >5"
autoComplete="off"
value={form.guestsAbove5} onChange={handleChange}
className="w-full border p-2 mb-2" />

<label className="block text-sm font-medium">Guests (≤5 yrs)</label>
<input name="guestsBelow5" placeholder="Guests <=5 (optional)"
autoComplete="off"
value={form.guestsBelow5} onChange={handleChange}
className="w-full border p-2 mb-2" />

{/* SINGLE */}
{form.property !== "Both" && (
<> 
<label className="block text-sm font-medium">Flats</label>
<input name="flats" placeholder="Flats"
autoComplete="off"
value={form.flats} onChange={handleChange}
className="w-full border p-2 mb-2" />

<label className="block text-sm font-medium">Discount</label>
<input name="discount" placeholder="Discount"
autoComplete="off"
value={form.discount} onChange={handleChange}
className="w-full border p-2 mb-2" />
</>
)}

{/* BOTH */}
{form.property === "Both" && (
<>
<label className="block text-sm font-medium">Elite Flats</label>
<input name="flatsElite" placeholder="Elite Flats"
autoComplete="off"
value={form.flatsElite || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />

<label className="block text-sm font-medium">Vrindavan Flats</label>
<input name="flatsVrindavan" placeholder="Vrindavan Flats"
autoComplete="off"
value={form.flatsVrindavan || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />

<label className="block text-sm font-medium">Elite Discount</label>
<input name="discountElite" placeholder="Elite Discount"
autoComplete="off"
value={form.discountElite || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />

<label className="block text-sm font-medium">Vrindavan Discount</label>
<input name="discountVrindavan" placeholder="Vrindavan Discount"
autoComplete="off"
value={form.discountVrindavan || ""}
onChange={handleChange}
className="w-full border p-2 mb-2" />
</>
)}

<div className="bg-gray-100 p-2 mb-2">
Nights: {nights} <br />
Price: {calculatePrice()}
</div>

<button
  type="button"
  onClick={save}
  className="bg-green-500 text-white w-full p-2 mb-3"
>
  Save Enquiry
</button>


{/* ===== SECTION 12: ENQUIRY LIST ===== */}


{enquiries
  .filter((e) => {

    if (activeTab === "New") {
      return e.status === "New";
    }

    if (activeTab === "Follow") {
      return ["SentQuote", "FollowUp1", "FollowUp2"].includes(e.status);
    }

    if (activeTab === "Closed") {
      return ["Final", "NoResponse"].includes(e.status);
    }

    if (activeTab === "Booked") {
      return e.status === "Booked";
    }

    return true;
  })
  .map((e, i) => (

  <div
  key={i}
  className={`border p-2 mb-2 ${
    e.status === "Booked" ? "border-green-500 bg-green-50" : ""
  }`}
>

    <div className="font-semibold">
      {e.name} - {e.phone}
    </div>

    <div className="text-sm text-gray-500 mb-2">
      Status: {e.status}
    </div>

<div className="text-xs text-gray-400">
  ID: {e.id}
</div>

    {/* ===== ACTION BUTTONS ===== */}

{/* NEW */}
{e.status === "New" && (
  <>
    <button
      onClick={() => sendQuote(i)}
      className="w-full bg-blue-500 text-white mb-1"
    >
      Send Quote
    </button>

    <button
      onClick={() => updateStatus(e.id, "Booked")}
      className="w-full bg-green-600 text-white"
    >
      Booked
    </button>
  </>
)}

{/* SENT QUOTE */}
{e.status === "SentQuote" && (
  <>
    <button
      onClick={() => updateStatus(e.id, "FollowUp1")}
      className="w-full bg-yellow-500 text-white mb-1"
    >
      Follow Up 1
    </button>

    <button
      onClick={() => updateStatus(e.id, "Booked")}
      className="w-full bg-green-600 text-white"
    >
      Booked
    </button>
  </>
)}

{/* FOLLOW UP 1 */}
{e.status === "FollowUp1" && (
  <>
    <button
      onClick={() => updateStatus(e.id, "FollowUp2")}
      className="w-full bg-orange-500 text-white mb-1"
    >
      Follow Up 2
    </button>

    <button
      onClick={() => updateStatus(e.id, "Booked")}
      className="w-full bg-green-600 text-white"
    >
      Booked
    </button>
  </>
)}

{/* FOLLOW UP 2 */}
{e.status === "FollowUp2" && (
  <>
    <button
      onClick={() => updateStatus(e.id, "Final")}
      className="w-full bg-purple-500 text-white mb-1"
    >
      Final
    </button>

    <button
      onClick={() => updateStatus(e.id, "Booked")}
      className="w-full bg-green-600 text-white"
    >
      Booked
    </button>
  </>
)}

{/* FINAL */}
{e.status === "Final" && (
  <>
    <button
      onClick={() => updateStatus(e.id, "NoResponse")}
      className="w-full bg-gray-500 text-white mb-1"
    >
      No Response
    </button>

    <button
      onClick={() => updateStatus(e.id, "Booked")}
      className="w-full bg-green-600 text-white"
    >
      Booked
    </button>
  </>
)}

{/* NO RESPONSE */}
{e.status === "NoResponse" && (
  <button
    onClick={() => updateStatus(e.id, "Booked")}
    className="w-full bg-green-600 text-white"
  >
    Booked
  </button>
)}

{/* BOOKED */}
{e.status === "Booked" && (
  <div className="text-green-600 font-semibold">
    ✅ Booked
  </div>
)}

  </div>

))}

</div>  

);
}