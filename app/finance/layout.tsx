"use client";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* TOP NAVBAR */}
      <div className="flex justify-between items-center p-3 border-b bg-white sticky top-0 z-10">
        <div className="flex gap-4 text-sm font-semibold overflow-x-auto">
          <a href="/finance/bookings">Bookings</a>
          <a href="/finance/expenses">Expenses</a>
          <a href="/finance/dashboard">Dashboard</a>
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem("finance_auth");
            window.location.reload();
          }}
          className="text-xs text-red-500"
        >
          Logout
        </button>
      </div>

      {/* PAGE CONTENT */}
      <div className="p-4">{children}</div>
    </div>
  );
}