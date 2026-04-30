"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [data, setData] = useState({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,

    eliteSales: 0,
    eliteExpenses: 0,

    vrindavanSales: 0,
    vrindavanExpenses: 0,
  });

  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });


const fetchData = async () => {
  // BOOKINGS QUERY
  let bookingQuery = supabase
    .from("bookings")
    .select("property, net_amount, booking_date");

  if (filters.from) {
    bookingQuery = bookingQuery.gte("booking_date", filters.from);
  }
  if (filters.to) {
    bookingQuery = bookingQuery.lte("booking_date", filters.to);
  }

  const { data: bookings } = await bookingQuery;

  // EXPENSES QUERY
  let expenseQuery = supabase
    .from("expenses")
    .select("property, net_amount, date");

  if (filters.from) {
    expenseQuery = expenseQuery.gte("date", filters.from);
  }
  if (filters.to) {
    expenseQuery = expenseQuery.lte("date", filters.to);
  }

  const { data: expenses } = await expenseQuery;

  let totalSales = 0;
  let totalExpenses = 0;

  let eliteSales = 0;
  let vrindavanSales = 0;

  let eliteExpenses = 0;
  let vrindavanExpenses = 0;

  // SALES
  bookings?.forEach((b) => {
    const amt = Number(b.net_amount || 0);
    totalSales += amt;

    if (b.property === "Mahas Elite") eliteSales += amt;
    if (b.property === "Mahas Vrindavan") vrindavanSales += amt;
  });

  // EXPENSES
  expenses?.forEach((e) => {
    const amt = Number(e.net_amount || 0);
    totalExpenses += amt;

    if (e.property === "Mahas Elite") {
      eliteExpenses += amt;
    } else if (e.property === "Mahas Vrindavan") {
      vrindavanExpenses += amt;
    } else if (e.property === "Common") {
      // 1/3 Elite, 2/3 Vrindavan
      eliteExpenses += amt / 3;
      vrindavanExpenses += (amt * 2) / 3;
    }
  });

  setData({
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses,

    eliteSales,
    eliteExpenses,

    vrindavanSales,
    vrindavanExpenses,
  });
};

    useEffect(() => {
      fetchData();
    }, [filters]);

  return (
    <div className="container space-y-4">
      <h2 className="text-xl font-bold text-center">Finance Dashboard</h2>

  <div className="flex gap-2 flex-wrap">
    <input
      type="date"
      value={filters.from}
      onChange={(e) =>
        setFilters({ ...filters, from: e.target.value })
      }
      className="input"
    />

    <input
      type="date"
      value={filters.to}
      onChange={(e) =>
        setFilters({ ...filters, to: e.target.value })
      }
      className="input"
    />

    
  </div>

      {/* OVERALL */}
      
      <div className="border rounded-lg p-3 bg-white shadow-sm">
        <p>
          Total Sales: ₹{data.totalSales.toLocaleString("en-IN")}
        </p>

        <p>
          Total Expenses: ₹{data.totalExpenses.toLocaleString("en-IN")}
        </p>

        <p className={`font-bold ${
          data.profit >= 0 ? "text-green-600" : "text-red-600"
        }`}>
          Profit: ₹{data.profit.toLocaleString("en-IN")}
        </p>
      </div>
      
      {/* ELITE */}
      <div className="border rounded-lg p-3 bg-white shadow-sm">
        
      <p className="font-bold">Mahas Elite</p>

      <p>
        Sales: ₹{data.eliteSales.toLocaleString("en-IN")}
      </p>

      <p>
        Expenses: ₹{data.eliteExpenses.toLocaleString("en-IN")}
      </p>

      <p className={`${
        data.eliteSales - data.eliteExpenses >= 0
        ? "text-green-600"
        : "text-red-600"
      }`}>
        Profit: ₹{(data.eliteSales - data.eliteExpenses).toLocaleString("en-IN")}
      </p>
        
      </div>

      {/* VRINDAVAN */}
      <div className="border rounded-lg p-3 bg-white shadow-sm">

        <p className="font-bold">Mahas Vrindavan</p>

        <p>
          Sales: ₹{data.vrindavanSales.toLocaleString("en-IN")}
        </p>

        <p>
          Expenses: ₹{data.vrindavanExpenses.toLocaleString("en-IN")}
        </p>

        <p className={`${
          data.vrindavanSales - data.vrindavanExpenses >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}>
          Profit: ₹{(data.vrindavanSales - data.vrindavanExpenses).toLocaleString("en-IN")}
         </p>

      </div>
    </div>
  );
}