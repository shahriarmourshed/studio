
import type { FamilyMember, Product, Expense, Budget, Income } from '@/lib/types';

export const familyMembers: Omit<FamilyMember, 'id' | 'createdAt'>[] = [];

const now = new Date();
const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

export const products: Omit<Product, 'id' | 'createdAt' | 'lastUpdated'>[] = [];

export const expenses: Omit<Expense, 'id' | 'createdAt'>[] = [];

export const incomes: Omit<Income, 'id' | 'createdAt'>[] = [];

export const budget: Budget = {
  total: 0,
  spent: 0,
  categories: [],
};
