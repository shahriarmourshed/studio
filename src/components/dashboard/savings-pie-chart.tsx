
"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"
import { useCurrency } from "@/context/currency-context"

const COLORS = {
  expenses: "hsl(var(--chart-4))", // A red shade
  savings: "hsl(var(--chart-1))", // A blue/primary shade
};

export default function SavingsPieChart({ income, expenses }: { income: number, expenses: number }) {
  const { getSymbol } = useCurrency();
  const savings = Math.max(0, income - expenses);

  const chartData = [
    { name: 'Expenses', value: expenses, color: COLORS.expenses },
    { name: 'Savings', value: savings, color: COLORS.savings },
  ];

  const totalIncome = income;

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
          formatter={(value: number, name: string) => [`${getSymbol()}${value.toLocaleString()}`, name]}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={60}
          dataKey="value"
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            formatter={(value, entry) => <span className="text-muted-foreground">{value}</span>}
        />
         <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="central"
            className="text-2xl font-bold fill-foreground"
            >
                {getSymbol()}{totalIncome.toLocaleString()}
            </text>
             <text 
            x="50%" 
            y="50%" 
            dy="20"
            textAnchor="middle" 
            dominantBaseline="central"
            className="text-sm fill-muted-foreground"
            >
                Total Income
            </text>
      </PieChart>
    </ResponsiveContainer>
  )
}
