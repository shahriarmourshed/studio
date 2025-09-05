
'use client';

import PageHeader from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ThemeSwitcher from '@/components/common/theme-switcher';
import { useData } from '@/context/data-context';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { reminderDays, setReminderDays } = useData();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="container mx-auto">
      <PageHeader title="Settings" subtitle="Manage your application settings." />

      <div className="px-4 sm:px-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your app experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Theme</p>
              <ThemeSwitcher />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Set how many days in advance you get reminders for planned bills.
                </p>
              </div>
              <Select
                value={String(reminderDays)}
                onValueChange={(value) => setReminderDays(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>View detailed reports and summaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile/plan-vs-actuals" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                <div>
                  <p className="font-medium">Plan vs. Actuals</p>
                  <p className="text-sm text-muted-foreground">Compare your planned budget against your actual spending.</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
             <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
