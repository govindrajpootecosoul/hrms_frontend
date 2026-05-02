'use client';

/**
 * Print-friendly payslip layout (EcoSoul-style).
 * Pass full payroll preview from GET /payroll/preview plus employee meta.
 */
const moneyInr = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const moneyWordsStub = (n) => {
  const x = Math.round(Number(n || 0));
  return `${moneyInr(x)} (amount in words — configure full converter if needed)`;
};

export default function SalaryPayslip({
  companyName = 'Company',
  companyAddress = 'Unit / Tower, Sector, City, State PIN India',
  monthYear,
  payDateStr,
  employee,
  preview,
}) {
  const earnings = preview?.earnings || [];
  const deductions = preview?.deductions || [];
  const gross = preview?.totals?.gross ?? 0;
  const dedTotal = preview?.totals?.deductionsTotal ?? 0;
  const net = preview?.totals?.netPay ?? 0;
  const att = preview?.attendance || {};
  const paidDays = att.paidDays ?? '—';
  const lopDays = att.lopDays ?? '—';

  const monthLabel = monthYear
    ? new Date(`${monthYear}-01T12:00:00`).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="salary-payslip-print bg-white text-slate-900 text-sm max-w-[860px] mx-auto border border-slate-300 p-6 print:border-0 print:shadow-none">
      <div className="flex justify-between items-start gap-4 border-b-2 border-slate-800 pb-4 mb-4">
        <div>
          <div className="text-lg font-bold">{companyName}</div>
          <div className="text-xs text-slate-600 mt-1 max-w-md leading-snug">{companyAddress}</div>
        </div>
        <div className="text-right text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-lg px-3 py-2">
          ECO SOUL
        </div>
      </div>

      <div className="text-center font-bold text-base mb-6">Payslip for the month of {monthLabel}</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-1.5 text-sm">
          <div>
            <span className="font-semibold">Employee Name: </span>
            {employee?.name || '—'}, {employee?.employeeId || '—'}
          </div>
          <div>
            <span className="font-semibold">Designation: </span>
            {employee?.jobTitle || '—'}
          </div>
          <div>
            <span className="font-semibold">Date of Joining: </span>
            {employee?.joiningDate
              ? new Date(employee.joiningDate).toLocaleDateString('en-GB')
              : '—'}
          </div>
          <div>
            <span className="font-semibold">Pay Period: </span>
            {monthLabel}
          </div>
          <div>
            <span className="font-semibold">Pay Date: </span>
            {payDateStr || '—'}
          </div>
          <div>
            <span className="font-semibold">PF A/C Number: </span>
            {employee?.pfNo || employee?.uan || '—'}
          </div>
          <div>
            <span className="font-semibold">Bank Account No: </span>
            {employee?.bankAccount || '—'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-right">₹{moneyInr(net)}</div>
          <div className="text-xs text-slate-600 text-right font-semibold">Total Net Pay</div>
          <div className="text-sm text-right border-t border-slate-200 pt-2">
            Paid Days : {paidDays} | LOP Days : {lopDays}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-300 mb-4">
        <div className="border-r border-slate-300 md:border-b-0 border-b">
          <div className="bg-slate-100 px-3 py-2 font-semibold text-xs border-b border-slate-300">Earnings</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-3 py-2 font-medium">Component</th>
                <th className="text-right px-3 py-2 font-medium">Amount</th>
                <th className="text-right px-3 py-2 font-medium">YTD</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((row) => (
                <tr key={row.code || row.name} className="border-b border-slate-100">
                  <td className="px-3 py-1.5">{row.name}</td>
                  <td className="px-3 py-1.5 text-right">₹{moneyInr(row.amount)}</td>
                  <td className="px-3 py-1.5 text-right text-slate-500">₹{moneyInr(row.amount)}</td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-50">
                <td className="px-3 py-2">Gross Earnings</td>
                <td className="px-3 py-2 text-right">₹{moneyInr(gross)}</td>
                <td className="px-3 py-2 text-right">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="bg-slate-100 px-3 py-2 font-semibold text-xs border-b border-slate-300">Deductions</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-3 py-2 font-medium">Component</th>
                <th className="text-right px-3 py-2 font-medium">Amount</th>
                <th className="text-right px-3 py-2 font-medium">YTD</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((row) => (
                <tr key={row.code || row.name} className="border-b border-slate-100">
                  <td className="px-3 py-1.5">{row.name}</td>
                  <td className="px-3 py-1.5 text-right">₹{moneyInr(row.amount)}</td>
                  <td className="px-3 py-1.5 text-right text-slate-500">₹{moneyInr(row.amount)}</td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-50">
                <td className="px-3 py-2">Total Deductions</td>
                <td className="px-3 py-2 text-right">₹{moneyInr(dedTotal)}</td>
                <td className="px-3 py-2 text-right">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table className="w-full text-xs border border-slate-300 mb-4">
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="px-3 py-2 font-medium">Gross Earnings</td>
            <td className="px-3 py-2 text-right">₹{moneyInr(gross)}</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="px-3 py-2 font-medium">Total Deductions</td>
            <td className="px-3 py-2 text-right">(-) ₹{moneyInr(dedTotal)}</td>
          </tr>
          <tr className="font-bold bg-slate-50">
            <td className="px-3 py-2">Total Net Payable</td>
            <td className="px-3 py-2 text-right">₹{moneyInr(net)}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-xs text-slate-700 space-y-2 border-t border-slate-200 pt-3">
        <p>
          <span className="font-semibold">Total Net Payable </span>₹{moneyInr(net)} ({moneyWordsStub(net)})
        </p>
        <p className="font-semibold">Total Net Payable = Gross Earnings − Total Deductions</p>
        <p className="text-center text-slate-500 pt-2">-- This is a system-generated document. --</p>
      </div>
    </div>
  );
}
