// Entry point: app/page.tsx
// Stage 3: Add budgeting features — set category budgets, compare actual vs budgeted, and show spending insights
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";

interface Transaction {
  _id?: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

const CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Other",
];
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#a2d5f2",
  "#d0ed57",
];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({
    amount: "",
    date: "",
    description: "",
    category: "Other",
  });
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await axios.get("/api/transactions");
    setTransactions(res.data);
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.date || !form.description || !form.category)
      return alert("All fields required");
    await axios.post("/api/transactions", form);
    setForm({ amount: "", date: "", description: "", category: "Other" });
    fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    await axios.delete(`/api/transactions/${id}`);
    fetchTransactions();
  };

  const handleBudgetChange = (category: string, value: string) => {
    setBudgets((prev) => ({ ...prev, [category]: parseFloat(value) || 0 }));
  };

  const monthlyData = transactions.reduce((acc: any, tx) => {
    const month = new Date(tx.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!acc[month]) acc[month] = 0;
    acc[month] += tx.amount;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([month, total]) => ({
    month,
    total,
  }));

  const categoryTotals: Record<string, number> = {};
  transactions.forEach((tx) => {
    const category = tx.category || "Other";
    if (!categoryTotals[category]) categoryTotals[category] = 0;
    categoryTotals[category] += tx.amount;
  });
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const recent = transactions.slice(0, 5);

  const budgetComparison = CATEGORIES.map((cat) => ({
    category: cat,
    budget: budgets[cat] || 0,
    actual: categoryTotals[cat] || 0,
  }));

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Personal Finance Dashboard</h1>

      <Card>
        <CardContent className="space-y-2">
          <Input
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Button onClick={handleSubmit}>Add Transaction</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-xl font-semibold">₹{totalSpent}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Top Category</p>
            <p className="text-xl font-semibold">
              {pieData.sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Recent Entry</p>
            <p className="text-sm">
              {recent[0]?.description || "N/A"} ({recent[0]?.category})
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">Set Monthly Budgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <label className="w-24">{cat}:</label>
                <Input
                  type="number"
                  placeholder="₹"
                  value={budgets[cat] || ""}
                  onChange={(e) => handleBudgetChange(cat, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Budget vs Actual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetComparison}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#82ca9d" name="Budget" />
              <Bar dataKey="actual" fill="#ff7f50" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Monthly Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Transactions</h2>
          <ul className="space-y-1">
            {transactions.map((tx) => (
              <li
                key={tx._id}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  {tx.date} - {tx.description} ({tx.category || "Other"}) - ₹
                  {tx.amount}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => deleteTransaction(tx._id!)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
