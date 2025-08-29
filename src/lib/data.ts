import type { FamilyMember, Product, Expense, Budget, Income } from '@/lib/types';

export const familyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Alex',
    avatarUrl: 'https://picsum.photos/100/100?random=1',
    age: 42,
    healthConditions: 'High cholesterol',
    dietaryRestrictions: 'Low-sodium',
  },
  {
    id: '2',
    name: 'Jane',
    avatarUrl: 'https://picsum.photos/100/100?random=2',
    age: 38,
    healthConditions: 'None',
    dietaryRestrictions: 'Vegetarian',
  },
  {
    id: '3',
    name: 'Leo',
    avatarUrl: 'https://picsum.photos/100/100?random=3',
    age: 12,
    healthConditions: 'None',
    dietaryRestrictions: 'None',
  },
  {
    id: '4',
    name: 'Mia',
    avatarUrl: 'https://picsum.photos/100/100?random=4',
    age: 8,
    healthConditions: 'Peanut allergy',
    dietaryRestrictions: 'No peanuts',
  },
];

const now = new Date();
const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

export const products: Product[] = [
  { id: 'p1', name: 'Basmati Rice', quantity: 25, currentStock: 20, unit: 'kg', price: 2500, purchaseDate: today, lastUpdated: now.toISOString(), dailyNeed: 0.5 },
  { id: 'p2', name: 'Whole Wheat Flour', quantity: 10, currentStock: 8, unit: 'kg', price: 500, purchaseDate: today, lastUpdated: now.toISOString(), monthlyNeed: 5 },
  { id: 'p3', name: 'Milk', quantity: 15, currentStock: 2, unit: 'l', price: 900, purchaseDate: today, lastUpdated: now.toISOString(), dailyNeed: 1 },
  { id: 'p4', name: 'Detergent Powder', quantity: 3, currentStock: 2.5, unit: 'kg', price: 650, purchaseDate: today, lastUpdated: now.toISOString(), monthlyNeed: 1 },
  { id: 'p5', name: 'Olive Oil', quantity: 2, currentStock: 1, unit: 'l', price: 1200, purchaseDate: today, lastUpdated: now.toISOString(), halfMonthlyNeed: 0.5 },
  { id: 'p6', name: 'Apples', quantity: 2, currentStock: 1, unit: 'kg', price: 400, purchaseDate: today, lastUpdated: now.toISOString(), dailyNeed: 0.2 },
];

export const expenses: Expense[] = [
  { id: 'e1', description: 'Weekly Groceries', amount: 3500, category: 'Groceries', date: '2024-07-25', recurrent: false },
  { id: 'e2', description: 'Electricity Bill', amount: 2200, category: 'Bills', date: '2024-07-22', recurrent: true },
  { id: 'e3', description: 'Movie Tickets', amount: 1200, category: 'Entertainment', date: '2024-07-24', recurrent: false },
  { id: 'e4', description: 'Fuel for Car', amount: 1500, category: 'Transport', date: '2024-07-23', recurrent: true },
  { id: 'e5', description: 'Internet Bill', amount: 800, category: 'Bills', date: '2024-07-20', recurrent: true },
];

export const incomes: Income[] = [
    { id: 'inc1', description: 'Monthly Salary', amount: 50000, category: 'Salary', date: '2024-07-01', recurrent: true }
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

export const upcomingBills = [
    { id: 'b1', name: 'Rent', amount: 25000, dueDate: '2024-08-01' },
    { id: 'b2', name: 'Water Bill', amount: 500, dueDate: '2024-08-05' },
    { id: 'b3', name: 'School Fees', amount: 15000, dueDate: '2024-08-10' },
]
