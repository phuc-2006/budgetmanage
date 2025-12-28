import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/lib/format';

interface ExpenseChartProps {
  transactions: Transaction[];
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categoryTotals = expenses.reduce((acc, t) => {
      const categoryId = t.category_id || 'uncategorized';
      const categoryName = t.category?.name || 'Không có danh mục';
      const categoryColor = t.category?.color || '#6b7280';
      const categoryIcon = t.category?.icon || '📝';
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          name: categoryName,
          value: 0,
          color: categoryColor,
          icon: categoryIcon,
        };
      }
      acc[categoryId].value += Number(t.amount);
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string; icon: string }>);

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpense = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Chi tiêu theo danh mục</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Chưa có dữ liệu chi tiêu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Chi tiêu theo danh mục</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / totalExpense) * 100).toFixed(1);
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.icon} {data.name}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
                        <p className="text-sm text-muted-foreground">{percentage}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2 mt-4">
          {chartData.slice(0, 5).map((item, index) => {
            const percentage = ((item.value / totalExpense) * 100).toFixed(1);
            return (
              <div 
                key={item.name} 
                className="flex items-center justify-between text-sm animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.icon} {item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{percentage}%</span>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
