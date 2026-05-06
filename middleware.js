import { NextResponse } from 'next/server';

const PAYROLL_COMPANY_COOKIE = 'hrms_payroll_company';

export function middleware(request) {
  const url = request.nextUrl.clone();

  // Only scope HRMS internal API calls (public prefixes; rewrites map these to /api/portals/hrms)
  const isHrmsApi =
    url.pathname === '/api/hrms' ||
    url.pathname.startsWith('/api/hrms/') ||
    url.pathname.startsWith('/api/hrms-portal/');
  if (!isHrmsApi) {
    const res = NextResponse.next();
    res.headers.set('x-hrms-payroll-filter', 'skip:not-hrms-api');
    return res;
  }

  // Only apply for Thrive company requests (when company is present)
  const company = url.searchParams.get('company');
  if (!company || String(company).toLowerCase() !== 'thrive') {
    const res = NextResponse.next();
    res.headers.set('x-hrms-payroll-filter', 'skip:not-thrive');
    return res;
  }

  const cookieVal = request.cookies.get(PAYROLL_COMPANY_COOKIE)?.value;
  const payrollCompany = cookieVal ? decodeURIComponent(cookieVal) : null;
  if (!payrollCompany || payrollCompany === 'all') {
    const res = NextResponse.next();
    res.headers.set('x-hrms-payroll-filter', 'skip:cookie-empty');
    return res;
  }

  // Avoid overriding explicitly provided param
  if (!url.searchParams.get('payrollCompany')) {
    url.searchParams.set('payrollCompany', payrollCompany);
    const res = NextResponse.rewrite(url);
    res.headers.set('x-hrms-payroll-filter', 'applied:rewrite');
    res.headers.set('x-hrms-payroll-company', payrollCompany);
    return res;
  }

  const res = NextResponse.next();
  res.headers.set('x-hrms-payroll-filter', 'skip:already-present');
  res.headers.set('x-hrms-payroll-company', payrollCompany);
  return res;
}

export const config = {
  matcher: ['/api/hrms', '/api/hrms/:path*', '/api/hrms-portal/:path*'],
};

