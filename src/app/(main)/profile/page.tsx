
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
import { ChevronRight } from 'lucide-react';

export default function ProfilePage() {

  const { reminderDays, setReminderDays } = useData();

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
      </div>
    </div>
  );
}
