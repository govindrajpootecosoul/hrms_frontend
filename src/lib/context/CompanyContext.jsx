'use client';

import { createContext, useContext, useState } from 'react';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

  const selectCompany = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      localStorage.setItem('selected_company_id', companyId);
    }
  };

  const loadCompanies = (userCompanies) => {
    setCompanies(userCompanies);
    
    // Try to restore previously selected company
    const savedCompanyId = localStorage.getItem('selected_company_id');
    if (savedCompanyId) {
      const company = userCompanies.find(c => c.id === savedCompanyId);
      if (company) {
        setCurrentCompany(company);
      }
    }
    
    // If no saved company, select the first one
    if (!currentCompany && userCompanies.length > 0) {
      setCurrentCompany(userCompanies[0]);
    }
  };

  const value = {
    currentCompany,
    companies,
    selectCompany,
    loadCompanies
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
