// Mock Data for Demo Purposes

export const mockServices = {
  bank: {
    name: 'Banking Services',
    providers: [
      { id: 1, name: 'State Bank Branch 1', address: 'Main Street' },
      { id: 2, name: 'HDFC Bank Downtown', address: 'Park Avenue' },
      { id: 3, name: 'ICICI Bank Central', address: 'MG Road' }
    ],
    types: ['Account Opening', 'Loan Application', 'Credit Card', 'Investment']
  },
  healthcare: {
    name: 'Healthcare',
    providers: [
      { id: 4, name: 'City Hospital', address: 'Hospital Road' },
      { id: 5, name: 'Apollo Clinic', address: 'Sector 5' },
      { id: 6, name: 'Max Healthcare', address: 'Green Park' }
    ],
    types: ['General Consultation', 'Specialist Visit', 'Lab Tests', 'Vaccination']
  },
  government: {
    name: 'Government Services',
    providers: [
      { id: 7, name: 'Passport Office', address: 'Government Complex' },
      { id: 8, name: 'License Authority', address: 'Transport Nagar' },
      { id: 9, name: 'Municipal Office', address: 'City Center' }
    ],
    types: ['Passport Application', 'License Renewal', 'Certificate Request', 'Tax Filing']
  },
  retail: {
    name: 'Retail Services',
    providers: [
      { id: 10, name: 'Electronics Store', address: 'Mall Road' },
      { id: 11, name: 'Customer Service Center', address: 'Shopping Complex' },
      { id: 12, name: 'Product Returns Desk', address: 'Trade Center' }
    ],
    types: ['Product Pickup', 'Returns/Exchange', 'Customer Support', 'Warranty Claim']
  }
};