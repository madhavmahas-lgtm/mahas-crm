'use client'
import { useState, useMemo } from "react";

export default function Home() {

  const TABS = [
    "New",
    "Modified",
    "Follow-up 1",
    "Follow-up 2",
    "Follow-up Final",
    "No Response",
    "Booked"
  ];

  const [activeTab, setActiveTab] = useState("New");
  const [enquiries, setEnquiries] = useState<any[]>([]);

  const empty = {
    name:"", phone:"", email:"",
    checkInDate:"", checkOutDate:"",
    guestsAbove5:"", guestsBelow5:"",
    property:"Mahas Elite",
    flats:"1", flatsElite:"1", flatsVrindavan:"1",
    discount:"", discountElite:"", discountVrindavan:"",
    status:"New"
  };

  const [form, setForm] = useState<any>(empty);
  const [editIndex, setEditIndex] = useState<number|null>(null);

  const nights = useMemo(()=>{
    if(!form.checkInDate || !form.checkOutDate) return 0;
    return Math.max(0,(new Date(form.checkOutDate).getTime()-new Date(form.checkInDate).getTime())/(1000*60*60*24));
  },[form.checkInDate,form.checkOutDate]);

  const handleChange=(e:any)=>{
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };

    if(name === "property"){
      if(value !== "Both"){
        updated.discountElite = "";
        updated.discountVrindavan = "";
      } else {
        updated.discount = "";
      }
    }

    setForm(updated);
  }

  const isValid = () => {
    if(!form.name || !form.phone) return false;
    if(!form.checkInDate || !form.checkOutDate) return false;
    if(!form.guestsAbove5) return false;

    if(form.property === "Both"){
      if(!form.flatsElite || !form.flatsVrindavan) return false;
    } else {
      if(!form.flats) return false;
    }

    return true;
  }

  const save=()=>{
    if(!isValid()){
      alert("Please fill all mandatory fields");
      return;
    }

    if(editIndex!==null){
      const arr=[...enquiries];
      arr[editIndex]={...form,status:"Modified"};
      setEnquiries(arr);
      setEditIndex(null);
      setActiveTab("Modified");
    }else{
      setEnquiries([...enquiries,{...form,status:"New"}]);
      setActiveTab("New");
    }

    setForm(empty);
  }

  const edit=(i:number)=>{
    setForm(enquiries[i]);
    setEditIndex(i);
  }

  const calculatePrice = () => {
    const g = Number(form.guestsAbove5 || 0);

    if(form.property === "Both"){
      const fe = Number(form.flatsElite || 1);
      const fv = Number(form.flatsVrindavan || 1);

      const elite = (3000*nights*fe) + (Math.max(0,g-(4*fe))*500*nights) - Number(form.discountElite||0);
      const vr = (6000*nights*fv) + (Math.max(0,g-(6*fv))*500*nights) - Number(form.discountVrindavan||0);

      return `Elite ₹${elite} / Vrindavan ₹${vr}`;
    }

    const flats = Number(form.flats || 1);
    const baseRate = form.property === "Mahas Elite" ? 3000 : 6000;
    const included = form.property === "Mahas Elite" ? 4 : 6;

    const total = (baseRate*nights*flats) + (Math.max(0,g-(included*flats))*500*nights) - Number(form.discount||0);
    return `₹${total}`;
  }

  // ✅ SEND QUOTE (FIXED FLOW + FULL MESSAGE)
  const sendQuote=(i:number)=>{
    setEnquiries(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], status: "SentQuote" };
      return updated;
    });

    setActiveTab("Follow-up 1");

    const e = enquiries[i];

    const formatDate = (d:any)=>{
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}-${dt.toLocaleString('en-IN',{month:'short'})}-${dt.getFullYear()}`;
};

const days = Math.max(0,
  (new Date(e.checkOutDate).getTime() - new Date(e.checkInDate).getTime())/(1000*60*60*24)
);

const g = Number(e.guestsAbove5 || 0);

let msg = `Hi ${e.name} 👋

📅 Check-in: ${formatDate(e.checkInDate)} (12:00 PM onwards)
📅 Check-out: ${formatDate(e.checkOutDate)} (before 11:00 AM)
🗓 Days: ${days}

👨‍👩‍👧 Guests (>5yrs): ${e.guestsAbove5}
👶 Guests (≤5yrs): ${e.guestsBelow5}
`;

if(e.property === "Both"){

  const fe = Number(e.flatsElite || 1);
  const fv = Number(e.flatsVrindavan || 1);

  const eliteBase = 3000 * days * fe;
  const eliteExtraGuests = Math.max(0, g - (4 * fe));
  const eliteExtra = eliteExtraGuests * 500 * days;
  const eliteTotal = eliteBase + eliteExtra - Number(e.discountElite || 0);

  const vrBase = 6000 * days * fv;
  const vrExtraGuests = Math.max(0, g - (6 * fv));
  const vrExtra = vrExtraGuests * 500 * days;
  const vrTotal = vrBase + vrExtra - Number(e.discountVrindavan || 0);

  const rec = eliteTotal <= vrTotal ? "Mahas Elite" : "Mahas Vrindavan";

  msg += `
🏠 MAHAS ELITE
Base: ${days} day(s) x ${fe} flat(s) x ₹3000 = ₹${eliteBase}
Extra Guests: ${days} day(s) x ${eliteExtraGuests} Guest(s) x ₹500 = ₹${eliteExtra}
Discount: ₹${e.discountElite || 0}
💰 Total: ₹${eliteTotal} (Including 5% GST)
⚡ Electricity: 20 units/day free, Extra unit ₹15

🏠 MAHAS VRINDAVAN
Base: ${days} day(s) x ${fv} flat(s) x ₹6000 = ₹${vrBase}
Extra Guests: ${days} day(s) x ${vrExtraGuests} Guest(s) x ₹500 = ₹${vrExtra}
Discount: ₹${e.discountVrindavan || 0}
💰 Total: ₹${vrTotal} (Including 5% GST)
⚡ Electricity: 30 units/day free, Extra unit ₹15

👉 Recommended: ${rec}
`;

} else {

  const flats = Number(e.flats || 1);
  const baseRate = e.property === "Mahas Elite" ? 3000 : 6000;
  const included = e.property === "Mahas Elite" ? 4 : 6;

  const base = baseRate * days * flats;
  const extraGuests = Math.max(0, g - (included * flats));
  const extra = extraGuests * 500 * days;
  const total = base + extra - Number(e.discount || 0);

  const elec = e.property === "Mahas Elite"
    ? "20 units/day free, Extra unit ₹15"
    : "30 units/day free, Extra unit ₹15";

  msg += `
🏠 ${e.property}
Base: ${days} day(s) x ${flats} flat(s) x ₹${baseRate} = ₹${base}
Extra Guests: ${days} day(s) x ${extraGuests} Guest(s) x ₹500 = ₹${extra}
Discount: ₹${e.discount || 0}
💰 Total: ₹${total} (Including 5% GST)
⚡ Electricity: ${elec}
`;
}

msg += `

Please confirm to proceed 🙏`;

    window.open(`https://wa.me/91${e.phone}?text=${encodeURIComponent(msg)}`);
  }

  const followUp = (i:number, nextStatus:string, nextTab:string)=>{
    setEnquiries(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], status: nextStatus };
      return updated;
    });

    setActiveTab(nextTab);

    const e = enquiries[i];
    const msg = `Hi ${e.name} 👋\nJust following up regarding your stay 😊`;

    window.open(`https://wa.me/91${e.phone}?text=${encodeURIComponent(msg)}`);
  }

  const markBooked=(i:number)=>{
    setEnquiries(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], status: "Booked" };
      return updated;
    });
    setActiveTab("Booked");
  }

  // ✅ FILTER BASED ON TAB VS STATUS
  const filtered = enquiries.filter(e => {

    if(activeTab === "New") return e.status === "New";
    if(activeTab === "Follow-up 1") return e.status === "SentQuote";
    if(activeTab === "Follow-up 2") return e.status === "Follow-up 1";
    if(activeTab === "Follow-up Final") return e.status === "Follow-up 2";
    if(activeTab === "No Response") return e.status === "Follow-up Final";
    if(activeTab === "Modified") return e.status === "Modified";
    if(activeTab === "Booked") return e.status === "Booked";

    return false;
  });

  return (
    <div className="p-4 max-w-md mx-auto">

      <h1 className="text-xl font-bold mb-3 text-center">Mahas Enquiry CRM</h1>

      <div className="flex gap-2 overflow-x-auto mb-3">
        {TABS.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} className={`px-3 py-1 border ${activeTab===t?"bg-blue-500 text-white":""}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">

        <input name="name" placeholder="Name *" value={form.name} onChange={handleChange} className="w-full border p-2"/>
        <input name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} className="w-full border p-2"/>
        <input name="email" placeholder="Email (optional)" value={form.email} onChange={handleChange} className="w-full border p-2"/>

        <select name="property" value={form.property} onChange={handleChange} className="w-full border p-2">
          <option>Mahas Elite</option>
          <option>Mahas Vrindavan</option>
          <option>Both</option>
        </select>

        <input type="date" name="checkInDate" value={form.checkInDate} onChange={handleChange} className="w-full border p-2"/>
        <input type="date" name="checkOutDate" value={form.checkOutDate} onChange={handleChange} className="w-full border p-2"/>

        <input name="guestsAbove5" placeholder="Guests >5 *" value={form.guestsAbove5} onChange={handleChange} className="w-full border p-2"/>
        <input name="guestsBelow5" placeholder="Guests ≤5 (optional)" value={form.guestsBelow5} onChange={handleChange} className="w-full border p-2"/>

        {form.property === "Both" ? (
          <>
            <input name="flatsElite" placeholder="Flats Elite *" value={form.flatsElite} onChange={handleChange} className="w-full border p-2"/>
            <input name="flatsVrindavan" placeholder="Flats Vrindavan *" value={form.flatsVrindavan} onChange={handleChange} className="w-full border p-2"/>
            <input name="discountElite" placeholder="Discount Elite" value={form.discountElite} onChange={handleChange} className="w-full border p-2"/>
            <input name="discountVrindavan" placeholder="Discount Vrindavan" value={form.discountVrindavan} onChange={handleChange} className="w-full border p-2"/>
          </>
        ):(
          <>
            <input name="flats" placeholder="Total Flats *" value={form.flats} onChange={handleChange} className="w-full border p-2"/>
            <input name="discount" placeholder="Discount" value={form.discount} onChange={handleChange} className="w-full border p-2"/>
          </>
        )}

        <div className="bg-gray-100 p-2">
          Nights: {nights}
          <br/>
          Price: {calculatePrice()}
        </div>

        <button onClick={save} className="bg-green-500 text-white w-full p-2">Save Enquiry</button>
      </div>

      <div>
        {filtered.map((e,i)=>(
          <div key={i} className="border p-3 mt-3">
            <b>{e.name}</b><br/>
            {e.property}<br/>
            Status: {e.status}

            <button onClick={()=>edit(i)} className="w-full bg-gray-300 mt-2">Edit</button>

            {e.status === "New" && (
              <button onClick={()=>sendQuote(i)} className="w-full bg-green-500 text-white mt-2">Send Quote</button>
            )}

            {/* Follow-up 1 */}
{e.status === "SentQuote" && (
  <button
    onClick={()=>followUp(i,"Follow-up 1","Follow-up 2")}
    className="w-full bg-yellow-400 mt-2"
  >
    Follow-up 1
  </button>
)}

{/* Follow-up 2 */}
{e.status === "Follow-up 1" && (
  <button
    onClick={()=>followUp(i,"Follow-up 2","Follow-up Final")}
    className="w-full bg-yellow-500 mt-2"
  >
    Follow-up 2
  </button>
)}

{/* Follow-up Final */}
{e.status === "Follow-up 2" && (
  <button
    onClick={()=>followUp(i,"Follow-up Final","No Response")}
    className="w-full bg-orange-500 mt-2"
  >
    Follow-up Final
  </button>
)}

{/* No Response */}
{e.status === "Follow-up Final" && (
  <button
    onClick={()=>followUp(i,"No Response","No Response")}
    className="w-full bg-red-500 mt-2"
  >
    Mark No Response
  </button>
)}

            {e.status !== "Booked" && (
              <button onClick={()=>markBooked(i)} className="w-full bg-blue-500 text-white mt-2">Mark Booked</button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
