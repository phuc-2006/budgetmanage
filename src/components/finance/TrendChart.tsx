import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyData } from '@/hooks/useMonthlyTrend';
import { formatCurrency } from '@/lib/format';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendChartProps {
  data: MonthlyData[];
  isLoading?: boolean;
}

export function TrendChart({ data, isLoading }: TrendChartProps) {
  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Xu hướng theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Xu hướng theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Chưa có dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const currentMonth = data[data.length - 1];
  const lastMonth = data[data.length - 2];
  
  let expenseTrend = 0;
  if (lastMonth && lastMonth.expense > 0) {
    expenseTrend = ((currentMonth.expense - lastMonth.expense) / lastMonth.expense) * 100;
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Xu hướng 6 tháng
          </CardTitle>
          {lastMonth && (
            <div className={`flex items-center gap-1 text-sm ${expenseTrend > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
              {expenseTrend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{expenseTrend > 0 ? '+' : ''}{expenseTrend.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name === 'income' ? 'Thu nhập' : 'Chi tiêu'}: {formatCurrency(Number(entry.value))}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                formatter={(value) => value === 'income' ? 'Thu nhập' : 'Chi tiêu'}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Tổng thu (6 tháng)</p>
            <p className="font-semibold text-emerald-500">
              {formatCurrency(data.reduce((sum, d) => sum + d.income, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Tổng chi (6 tháng)</p>
            <p className="font-semibold text-destructive">
              {formatCurrency(data.reduce((sum, d) => sum + d.expense, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
