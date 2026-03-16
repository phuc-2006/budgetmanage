import { useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Moon, Sun, Calendar, Download, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useExportTransactions } from '@/hooks/useExportTransactions';
import { useImportTransactions } from '@/hooks/useImportTransactions';
import { useExportDebts } from '@/hooks/useExportDebts';
import { useImportDebts } from '@/hooks/useImportDebts';
import { AppHeader } from '@/components/layout/AppHeader';

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const { showDayOfWeek, setShowDayOfWeek, theme, setTheme } = useSettings();
  const { exportToExcel, isLoading: isExporting, transactionCount } = useExportTransactions();
  const { importFromExcel, isImporting } = useImportTransactions();
  const { exportToExcel: exportDebts, isLoading: isExportingDebts, debtCount } = useExportDebts();
  const { importFromExcel: importDebts, isImporting: isImportingDebts } = useImportDebts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debtFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importFromExcel(file);
      // Reset input to allow re-uploading same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Dữ liệu</CardTitle>
            <CardDescription>Quản lý và xuất dữ liệu giao dịch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export to Excel */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Xuất file Excel</Label>
                  <p className="text-sm text-muted-foreground">
                    Tải xuống toàn bộ {transactionCount} giao dịch dưới dạng file Excel
                  </p>
                </div>
              </div>
              <Button 
                onClick={exportToExcel} 
                disabled={isExporting || transactionCount === 0}
                variant="outline"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống
                  </>
                )}
              </Button>
            </div>

            {/* Import from Excel */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Nhập từ file Excel</Label>
                  <p className="text-sm text-muted-foreground">
                    Tải lên file Excel để nhập giao dịch mới
                  </p>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
                  className="hidden"
                  id="excel-upload"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isImporting}
                  variant="outline"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang nhập...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Tải lên
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
