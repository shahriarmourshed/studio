"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"
import { useCurrency } from "@/context/currency-context"
import type { Expense } from "@/lib/types"

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function ExpenseChart({ expenses }: { expenses: Expense[] }) {
  const { convert, getSymbol } = useCurrency();

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
          contentStyle={{ 
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)"
          }}
          formatter={(value: number) => `${getSymbol()}${value.toLocaleString()}`}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  )
}
