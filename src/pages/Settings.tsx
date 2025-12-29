import { Navigate } from 'react-router-dom';
import { Moon, Sun, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { AppHeader } from '@/components/layout/AppHeader';

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const { showDayOfWeek, setShowDayOfWeek, theme, setTheme } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onSignOut={signOut} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <h2 className="text-2xl font-bold">Cài đặt</h2>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Giao diện</CardTitle>
            <CardDescription>Tùy chỉnh giao diện ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="theme-toggle" className="font-medium">Chế độ tối</Label>
                  <p className="text-sm text-muted-foreground">
                    Bật chế độ tối để giảm mỏi mắt
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {/* Day of Week Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="day-toggle" className="font-medium">Hiển thị thứ</Label>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị thứ trong tuần bên cạnh ngày giao dịch
                  </p>
                </div>
              </div>
              <Switch
                id="day-toggle"
                checked={showDayOfWeek}
                onCheckedChange={setShowDayOfWeek}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
