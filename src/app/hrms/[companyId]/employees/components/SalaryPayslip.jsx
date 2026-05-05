'use client';

/**
 * Print-friendly payslip — EcoSoul-style layout (header, pay summary + net, earnings/deductions, net summary).
 * Pass payroll preview from GET /payroll/preview plus employee meta.
 */
const moneyInr = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const moneyWordsStub = (n) => {
  const x = Math.round(Number(n || 0));
  return `${moneyInr(x)} (Indian Rupee amount in words — configure converter if needed)`;
};

/** Payslip line label for deductions (matches common register wording). */
function deductionLabel(row) {
  const code = String(row?.code || '');
  if (code === 'PF_EMP') return 'EPF Contribution';
  if (code === 'PF_EMPR') return 'Employer PF (deducted)';
  if (code === 'ESI_EMP') return 'ESIC (Employee)';
  return row?.name || 'Deduction';
}

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
  const gross = Number(preview?.totals?.gross ?? 0);
  const dedTotal = Number(preview?.totals?.deductionsTotal ?? 0);
  const net = Number(preview?.totals?.netPay ?? 0);
  const att = preview?.attendance || {};
  const paidDays = att.paidDays ?? '—';
  const lopDays = att.lopDays ?? '—';

  const monthLabel = monthYear
    ? new Date(`${monthYear}-01T12:00:00`).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  const padEarn = Math.max(0, deductions.length - earnings.length);
  const padDed = Math.max(0, earnings.length - deductions.length);

  const cell = 'px-3 py-2 text-xs text-slate-800 border-b border-slate-100';
  const th3 = 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200 bg-slate-50';

  return (
    <div className="salary-payslip-print mx-auto max-w-[880px] print:max-w-none">
      <div className="rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm print:shadow-none print:border-slate-300">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 pt-5 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold leading-tight text-slate-900">{companyName}</div>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-600">{companyAddress}</p>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
              <span className="text-xs font-bold tracking-wide text-emerald-700">ECO SOUL</span>
            </div>
          </div>
        </div>

        {/* Title band */}
        <div className="border-b border-slate-200 bg-slate-100 px-4 py-2.5 text-center">
          <span className="text-sm font-bold text-slate-900">Payslip for the month of {monthLabel}</span>
        </div>

        {/* Pay summary | Net pay */}
        <div className="grid grid-cols-1 border-b border-slate-200 md:grid-cols-2">
          <div className="space-y-2 border-b border-slate-200 px-5 py-5 text-sm md:border-b-0 md:border-r">
            <Row label="Employee Name" value={`${employee?.name || '—'}, ${employee?.employeeId || '—'}`} />
            <Row label="Designation" value={employee?.jobTitle || '—'} />
            <Row
              label="Date of Joining"
              value={
                employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '—'
              }
            />
            <Row label="Pay Period" value={monthLabel} />
            <Row label="Pay Date" value={payDateStr || '—'} />
            <Row label="PF A/C Number" value={employee?.pfNo || employee?.uan || '—'} />
            <Row label="Bank Account No" value={employee?.bankAccount || '—'} />
          </div>
          <div className="flex flex-col items-center justify-center px-5 py-8 text-center md:py-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Net Pay</div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">₹{moneyInr(net)}</div>
            <div className="mt-4 text-sm text-slate-600">
              Paid Days : {paidDays} <span className="text-slate-400">|</span> LOP Days : {lopDays}
            </div>
          </div>
        </div>

        {/* Earnings | Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b border-slate-200 md:border-b-0 md:border-r">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800">
              Earnings
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={`${th3} w-[42%]`}>Component</th>
                  <th className={`${th3} text-right`}>Amount</th>
                  <th className={`${th3} text-right`}>YTD</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((row) => (
                  <tr key={row.code || row.name}>
                    <td className={`${cell} text-left`}>{row.name}</td>
                    <td className={`${cell} text-right tabular-nums`}>₹{moneyInr(row.amount)}</td>
                    <td className={`${cell} text-right tabular-nums text-slate-500`}>₹{moneyInr(row.amount)}</td>
                  </tr>
                ))}
                {Array.from({ length: padEarn }).map((_, i) => (
                  <tr key={`e-pad-${i}`}>
                    <td className={`${cell} border-slate-50 py-2.5`} colSpan={3}>
                      &nbsp;
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td className="px-3 py-2.5 text-xs text-slate-900">Gross Earnings</td>
                  <td className="px-3 py-2.5 text-right text-xs tabular-nums text-slate-900">₹{moneyInr(gross)}</td>
                  <td className="px-3 py-2.5 text-right text-xs text-slate-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800">
              Deductions
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={`${th3} w-[42%]`}>Component</th>
                  <th className={`${th3} text-right`}>Amount</th>
                  <th className={`${th3} text-right`}>YTD</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((row) => (
                  <tr key={row.code || row.name}>
                    <td className={`${cell} text-left`}>{deductionLabel(row)}</td>
                    <td className={`${cell} text-right tabular-nums`}>₹{moneyInr(row.amount)}</td>
                    <td className={`${cell} text-right tabular-nums text-slate-500`}>₹{moneyInr(row.amount)}</td>
                  </tr>
                ))}
                {Array.from({ length: padDed }).map((_, i) => (
                  <tr key={`d-pad-${i}`}>
                    <td className={`${cell} border-slate-50 py-2.5`} colSpan={3}>
                      &nbsp;
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td className="px-3 py-2.5 text-xs text-slate-900">Total Deductions</td>
                  <td className="px-3 py-2.5 text-right text-xs tabular-nums text-slate-900">₹{moneyInr(dedTotal)}</td>
                  <td className="px-3 py-2.5 text-right text-xs text-slate-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Net pay strip */}
        <div className="border-t border-slate-200 bg-slate-100">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-800">
            <span>Net Pay</span>
            <span>Amount</span>
          </div>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100 bg-white">
                <td className="px-4 py-2 font-medium text-slate-800">Gross Earnings</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-800">₹{moneyInr(gross)}</td>
              </tr>
              <tr className="border-b border-slate-100 bg-white">
                <td className="px-4 py-2 font-medium text-slate-800">Total Deductions</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-800">(-) ₹{moneyInr(dedTotal)}</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="px-4 py-2.5 text-slate-900">Total Net Payable</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">₹{moneyInr(net)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* In-box footer */}
        <div className="space-y-2 border-t border-slate-200 px-5 py-4 text-xs leading-relaxed text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Total Net Payable </span>
            <span className="font-semibold text-slate-900">₹{moneyInr(net)}</span> ({moneyWordsStub(net)})
          </p>
          <p className="font-semibold text-slate-800">Total Net Payable = Gross Earnings − Total Deductions</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-slate-500">-- This is a system-generated document. --</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="text-xs sm:text-sm">
      <span className="font-semibold text-slate-800">{label}: </span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}
