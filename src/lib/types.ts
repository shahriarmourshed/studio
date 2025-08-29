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
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'pack';
  price: number;
  lastUpdated: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: 'Groceries' | 'Bills' | 'Transport' | 'Entertainment' | 'Other';
  date: string;
  recurrent: boolean;
};

export type Budget = {
  total: number;
  spent: number;
  categories: {
    name: 'Groceries' | 'Bills' | 'Transport' | 'Entertainment' | 'Other';
    amount: number;
  }[];
};
