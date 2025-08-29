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
  name: string;
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'pack' | 'dozen' | 'box' | 'bottle' | 'can' | 'roll';
  price: number;
  dailyNeed?: number;
  monthlyNeed?: number;
  halfMonthlyNeed?: number;
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
