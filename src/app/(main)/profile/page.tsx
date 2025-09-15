

'use client';

import { useState } from 'react';
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
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { reminderDays, setReminderDays, clearAllUserData } = useData();
  const { logout, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllUserData();
      toast({
        title: "Success",
        description: "All of your data has been successfully deleted.",
      })
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear all data. Please try again.",
      })
    }
  }
  
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
            <CardTitle>Account</CardTitle>
             <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout
                </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Clear All Data</p>
                    <p className="text-sm text-muted-foreground">Permanently delete all your data, including expenses, incomes, products, and family members.</p>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <ShieldAlert className="mr-2 h-4 w-4"/>
                            Clear All Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all of your application data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllData}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


    