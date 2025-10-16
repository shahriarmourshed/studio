
"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"
import { useCurrency } from "@/context/currency-context"
import type { Expense, ExpenseCategory } from "@/lib/types"
import { useMemo } from "react";

const BASE_COLORS = [
    "hsl(var(--chart-1))", 
    "hsl(var(--chart-2))", 
    "hsl(var(--chart-3))", 
    "hsl(var(--chart-4))", 
    "hsl(var(--chart-5))",
    "hsl(22, 82%, 60%)",
    "hsl(30, 82%, 60%)",
    "hsl(40, 82%, 60%)",
    "hsl(50, 82%, 60%)",
    "hsl(180, 82%, 60%)",
    "hsl(200, 82%, 60%)",
    "hsl(220, 82%, 60%)",
    "hsl(240, 82%, 60%)",
];

const CustomTooltip = ({ active, payload }: any) => {
    const { getSymbol } = useCurrency();
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="p-2 bg-background border border-border rounded-lg shadow-lg text-foreground">
                <p className="font-medium">{`${data.name}: ${getSymbol()}${data.value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};


export default function ExpenseChart({ expenses, categories }: { expenses: Expense[], categories: ExpenseCategory[] }) {
  const { getSymbol } = useCurrency();

  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category, index) => {
        map.set(category.name, BASE_COLORS[index % BASE_COLORS.length]);
    });
    return map;
  }, [categories]);

  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
        acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value: value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={<CustomTooltip />}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={categoryColorMap.get(entry.name) || BASE_COLORS[index % BASE_COLORS.length]} />
          ))}
        </Pie>
        <Legend 
            iconSize={10} 
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
