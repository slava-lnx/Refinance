import { createContext, useContext, useState } from 'react';

const FunnelContext = createContext();

export function FunnelProvider({ children }) {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const reset = () => { setFormData({}); setCurrentStep(0); };

  return (
    <FunnelContext.Provider value={{ formData, updateField, currentStep, setCurrentStep, nextStep, prevStep, reset }}>
      {children}
    </FunnelContext.Provider>
  );
}

export function useFunnel() {
  return useContext(FunnelContext);
}
