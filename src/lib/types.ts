export type FamilyMember = {
  id: string;
  name: string;
  avatarUrl: string;
  age: number;
  healthConditions: string;
  dietaryRestrictions: string;
};

export type Product = {
  id: string;
  name:string;
  quantity: number; // Represents the last purchased quantity
  currentStock: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'pack' | 'dozen' | 'box' | 'bottle' | 'can' | 'roll';
  price: number;
  purchaseDate: string;
  consumptionRate?: number;
  consumptionPeriod?: 'daily' | 'weekly' | 'half-monthly' | 'monthly';
  lastUpdated: string; // ISO string to track when stock was last updated
};

export type ExpenseCategory = 
  | 'Groceries' 
  | 'Bills' 
  | 'Housing' 
  | 'Transport' 
  | 'Health'
  | 'Education'
  | 'Entertainment' 
  | 'Personal Care'
  | 'Other';

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  recurrent: boolean;
};

export type IncomeCategory = 'Salary' | 'Business' | 'Investment' | 'Gift' | 'Other';

export type Income = {
  id:string;
  description: string;
  amount: number;
  category: IncomeCategory;
  date: string;
  recurrent: boolean;
};

export type Budget = {
  total: number;
  spent: number;
  categories: {
    name: ExpenseCategory;
    amount: number;
  }[];
};
