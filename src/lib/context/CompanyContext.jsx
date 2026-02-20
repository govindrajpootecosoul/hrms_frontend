'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  // Initialize from localStorage immediately for faster loading
  const [currentCompany, setCurrentCompany] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCompanyId = localStorage.getItem('selected_company_id');
      const savedCompany = localStorage.getItem('selected_company');
      if (savedCompany) {
        try {
          return JSON.parse(savedCompany);
        } catch (e) {
          console.error('Error parsing saved company:', e);
        }
      }
    }
    return null;
  });
  const [companies, setCompanies] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        try {
          return JSON.parse(savedCompanies);
        } catch (e) {
          console.error('Error parsing saved companies:', e);
        }
      }
    }
    return [];
  });

  // Initialize company from sessionStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined' && !currentCompany) {
      // Try to get company from sessionStorage
      const sessionCompany = sessionStorage.getItem('selectedCompany') || 
                            sessionStorage.getItem('adminSelectedCompany');
      if (sessionCompany) {
        // Create a temporary company object from sessionStorage
        const tempCompany = {
          id: sessionStorage.getItem('selected_company_id') || '1',
          name: sessionCompany
        };
        setCurrentCompany(tempCompany);
        localStorage.setItem('selected_company', JSON.stringify(tempCompany));
      }
    }
  }, []);

  const selectCompany = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      localStorage.setItem('selected_company_id', companyId);
      localStorage.setItem('selected_company', JSON.stringify(company));
      // Also set in sessionStorage for immediate access
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedCompany', company.name);
        sessionStorage.setItem(`company_${companyId}`, company.name);
      }
    }
  };

  const loadCompanies = (userCompanies) => {
    setCompanies(userCompanies);
    // Save to localStorage for faster loading
    if (typeof window !== 'undefined') {
      localStorage.setItem('companies', JSON.stringify(userCompanies));
    }
    
    // Try to restore previously selected company
    const savedCompanyId = localStorage.getItem('selected_company_id');
    if (savedCompanyId) {
      const company = userCompanies.find(c => c.id === savedCompanyId);
      if (company) {
        setCurrentCompany(company);
        localStorage.setItem('selected_company', JSON.stringify(company));
        // Also set in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('selectedCompany', company.name);
          sessionStorage.setItem(`company_${savedCompanyId}`, company.name);
        }
        return;
      }
    }
    
    // If no saved company, select the first one
    if (!currentCompany && userCompanies.length > 0) {
      const firstCompany = userCompanies[0];
      setCurrentCompany(firstCompany);
      localStorage.setItem('selected_company_id', firstCompany.id);
      localStorage.setItem('selected_company', JSON.stringify(firstCompany));
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedCompany', firstCompany.name);
        sessionStorage.setItem(`company_${firstCompany.id}`, firstCompany.name);
      }
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
