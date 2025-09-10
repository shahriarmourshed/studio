
import type { FamilyMember, Product, Expense, Budget, Income } from '@/lib/types';

export const familyMembers: Omit<FamilyMember, 'id'>[] = [
  {
    name: 'Alex',
    avatarUrl: 'https://picsum.photos/100/100?random=1',
    age: 42,
    healthConditions: 'High cholesterol',
    dietaryRestrictions: 'Low-sodium',
  },
  {
    name: 'Jane',
    avatarUrl: 'https://picsum.photos/100/100?random=2',
    age: 38,
    healthConditions: 'None',
    dietaryRestrictions: 'Vegetarian',
  },
  {
    name: 'Leo',
    avatarUrl: 'https://picsum.photos/100/100?random=3',
    age: 12,
    healthConditions: 'None',
    dietaryRestrictions: 'None',
  },
  {
    name: 'Mia',
    avatarUrl: 'https://picsum.photos/100/100?random=4',
    age: 8,
    healthConditions: 'Peanut allergy',
    dietaryRestrictions: 'No peanuts',
  },
];

const now = new Date();
const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

export const products: Omit<Product, 'id'>[] = [
  { name: 'Basmati Rice', quantity: 25, currentStock: 20, unit: 'kg', price: 2500, purchaseDate: today, lastUpdated: now.toISOString(), consumptionRate: 0.5, consumptionPeriod: 'daily' },
  { name: 'Whole Wheat Flour', quantity: 10, currentStock: 8, unit: 'kg', price: 500, purchaseDate: today, lastUpdated: now.toISOString(), consumptionRate: 5, consumptionPeriod: 'monthly' },
  { name: 'Milk', quantity: 15, currentStock: 2, unit: 'l', price: 900, purchaseDate: today, lastUpdated: now.toISOString(), consumptionRate: 1, consumptionPeriod: 'daily' },
  { name: 'Detergent Powder', quantity: 3, currentStock: 2.5, unit: 'kg', price: 650, purchaseDate: today, lastUpdated: now.toISOString(), consumptionRate: 1, consumptionPeriod: 'monthly' },
  { name: 'Olive Oil', quantity: 2, currentStock: 1, unit: 'l', price: 1200, purchaseDate: today, lastUpdated: now.toISOString(), consumptionRate: 0.5, consumptionPeriod: 'half-monthly' },
  { name: 'Apples', quantity: 2, currentStock: 1, unit: 'kg', price: 400, purchaseDate: today, lastUpdated: now.toISOString(), consumptionRate: 0.2, consumptionPeriod: 'daily' },
];

export const expenses: Omit<Expense, 'id'>[] = [
  { description: 'Weekly Groceries', amount: 3500, category: 'Groceries', date: '2024-07-25', recurrent: false, status: 'planned', notes: 'Buy organic vegetables' },
  { description: 'Electricity Bill', amount: 2200, category: 'Bills', date: '2024-08-22', recurrent: true, status: 'planned' },
  { description: 'Movie Tickets', amount: 1200, category: 'Entertainment', date: '2024-07-24', recurrent: false, status: 'completed', notes: 'Watched the new action movie' },
  { description: 'Fuel for Car', amount: 1500, category: 'Transport', date: '2024-08-23', recurrent: true, status: 'planned' },
  { description: 'Internet Bill', amount: 800, category: 'Bills', date: '2024-08-20', recurrent: true, status: 'completed' },
];

export const incomes: Omit<Income, 'id'>[] = [
    { description: 'Monthly Salary', amount: 50000, category: 'Salary', date: '2024-07-01', recurrent: true, status: 'completed' }
];

export const budget: Budget = {
  total: 50000,
  spent: 27850,
  categories: [
    { name: 'Groceries', amount: 12000 },
    { name: 'Bills', amount: 8000 },
    { name: 'Housing', amount: 15000 },
    { name: 'Transport', amount: 5000 },
    { name: 'Health', amount: 3000 },
    { name: 'Education', amount: 6000 },
    { name: 'Entertainment', amount: 4000 },
    { name: 'Personal Care', amount: 2000 },
    { name: 'Other', amount: 3000 },
  ],
};
