

'use client';

import { useState, useEffect } from 'react';
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
import { LogOut, ShieldAlert, Trash2, PlusCircle, Bell, Clock, ShoppingBasket, CalendarClock } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { requestForToken } from '@/lib/firebase';
import type { NotificationSettings } from '@/lib/types';
import { Switch } from '@/components/ui/switch';

export default function ProfilePage() {
  const { 
    settings, 
    setReminderDays, 
    clearAllUserData, 
    expenseCategories, 
    addExpenseCategory, 
    deleteExpenseCategory,
    incomeCategories,
    addIncomeCategory,
    deleteIncomeCategory,
    addFcmToken,
    setNotificationSettings,
  } = useData();
  const { logout, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [newExpenseCategoryName, setNewExpenseCategoryName] = useState('');
  const [newIncomeCategoryName, setNewIncomeCategoryName] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      if ('permissions' in navigator) {
        navigator.permissions.query({name: 'notifications'}).then(permissionStatus => {
          setNotificationPermission(permissionStatus.state);
          permissionStatus.onchange = () => {
            setNotificationPermission(permissionStatus.state);
          };
        });
      }
    }
  }, []);

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

  const handleAddExpenseCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpenseCategoryName.trim()) {
      addExpenseCategory(newExpenseCategoryName.trim());
      setNewExpenseCategoryName('');
      toast({
        title: "Category Added",
        description: `${newExpenseCategoryName.trim()} has been added to your expense categories.`
      })
    }
  }

  const handleDeleteExpenseCategory = (categoryId: string, categoryName: string) => {
    deleteExpenseCategory(categoryId);
    toast({
      title: "Category Deleted",
      description: `${categoryName} has been deleted.`
    })
  }

  const handleAddIncomeCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncomeCategoryName.trim()) {
      addIncomeCategory(newIncomeCategoryName.trim());
      setNewIncomeCategoryName('');
      toast({
        title: "Category Added",
        description: `${newIncomeCategoryName.trim()} has been added to your income categories.`
      })
    }
  }

  const handleDeleteIncomeCategory = (categoryId: string, categoryName: string) => {
    deleteIncomeCategory(categoryId);
    toast({
      title: "Category Deleted",
      description: `${categoryName} has been deleted.`
    })
  }

  const handleNotificationPermission = async () => {
    if (notificationPermission === 'granted') {
      toast({
        title: "Notifications are already enabled.",
      });
      return;
    }
    
    const token = await requestForToken();
    if (token) {
        await addFcmToken(token);
        toast({
            title: "Notifications Enabled",
            description: "You will now receive notifications on this device.",
        });
        setNotificationPermission('granted');
    } else {
        toast({
            variant: 'destructive',
            title: "Notifications Blocked",
            description: "Permission was not granted. Please enable notifications in your browser or system settings.",
        })
        setNotificationPermission('denied');
    }
  }

  const handleNotificationSettingChange = (
    category: keyof NotificationSettings, 
    field: 'enabled' | 'time' | 'daysBefore', 
    value: boolean | string | number
  ) => {
      if (!settings) return;
      const newSettings = { ...settings.notificationSettings };
      (newSettings[category] as any)[field] = value;
      setNotificationSettings(newSettings);
  };
  
  return (
    <div className="container mx-auto">
      <PageHeader title="Settings" subtitle="Manage your application settings." />

      <div className="px-4 sm:px-0 grid gap-4 md:grid-cols-2">
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
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage push notifications for alerts and reminders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                    <p className="font-medium">Push Notification Permission</p>
                    <p className="text-sm text-muted-foreground">
                        Status: <span className="font-semibold capitalize">{notificationPermission}</span>
                    </p>
                </div>
                <Button 
                    onClick={handleNotificationPermission} 
                    disabled={notificationPermission === 'granted'}
                    size="sm"
                >
                    <Bell className="mr-2 h-4 w-4"/>
                    {notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
                </Button>
            </div>
            {notificationPermission === 'granted' && (
              <div className="space-y-4 pt-4">
                <Separator />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="font-medium">Upcoming Transactions</p>
                           <p className="text-xs text-muted-foreground">Remind me before a bill is due.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={String(settings?.reminderDays)}
                            onValueChange={(value) => setReminderDays(Number(value))}
                            disabled={!settings.notificationSettings.transactions.enabled}
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
                        <Input 
                            type="time" 
                            className="w-28" 
                            value={settings.notificationSettings.transactions.time}
                            onChange={(e) => handleNotificationSettingChange('transactions', 'time', e.target.value)}
                            disabled={!settings.notificationSettings.transactions.enabled}
                        />
                        <Switch 
                          checked={settings.notificationSettings.transactions.enabled}
                          onCheckedChange={(checked) => handleNotificationSettingChange('transactions', 'enabled', checked)}
                        />
                    </div>
                </div>
                 <Separator />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <ShoppingBasket className="h-5 w-5 text-primary"/>
                         <div>
                          <p className="font-medium">Low Stock Alerts</p>
                          <p className="text-xs text-muted-foreground">Notify me when products are running low.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input 
                          type="time" 
                          className="w-28" 
                          value={settings.notificationSettings.lowStock.time}
                          onChange={(e) => handleNotificationSettingChange('lowStock', 'time', e.target.value)}
                          disabled={!settings.notificationSettings.lowStock.enabled}
                        />
                        <Switch 
                          checked={settings.notificationSettings.lowStock.enabled}
                          onCheckedChange={(checked) => handleNotificationSettingChange('lowStock', 'enabled', checked)}
                        />
                    </div>
                </div>
                 <Separator />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <CalendarClock className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="font-medium">Upcoming Events</p>
                          <p className="text-xs text-muted-foreground">Get reminders for birthdays & anniversaries.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Select
                            value={String(settings?.notificationSettings.events.daysBefore)}
                            onValueChange={(value) => handleNotificationSettingChange('events', 'daysBefore', Number(value))}
                            disabled={!settings.notificationSettings.events.enabled}
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
                        <Input 
                          type="time" 
                          className="w-28" 
                          value={settings.notificationSettings.events.time}
                          onChange={(e) => handleNotificationSettingChange('events', 'time', e.target.value)}
                          disabled={!settings.notificationSettings.events.enabled}
                        />
                        <Switch 
                          checked={settings.notificationSettings.events.enabled}
                          onCheckedChange={(checked) => handleNotificationSettingChange('events', 'enabled', checked)}
                        />
                    </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Manage Expense Categories</CardTitle>
                <CardDescription>Add or remove custom expense categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddExpenseCategory} className="flex items-center gap-2 mb-4">
                    <Input 
                        placeholder="New expense category..."
                        value={newExpenseCategoryName}
                        onChange={(e) => setNewExpenseCategoryName(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only">Add Category</span>
                    </Button>
                </form>
                <ScrollArea className="h-40 rounded-md border">
                    <div className="p-2">
                    {expenseCategories.map(category => (
                        <div key={category.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <span className="text-sm font-medium">{category.name}</span>
                            {!category.isDefault ? (
                               <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the "{category.name}" category.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteExpenseCategory(category.id, category.name)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <span className="text-xs text-muted-foreground pr-2">Default</span>
                            )}
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Manage Income Categories</CardTitle>
                <CardDescription>Add or remove custom income categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddIncomeCategory} className="flex items-center gap-2 mb-4">
                    <Input 
                        placeholder="New income category..."
                        value={newIncomeCategoryName}
                        onChange={(e) => setNewIncomeCategoryName(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only">Add Category</span>
                    </Button>
                </form>
                <ScrollArea className="h-40 rounded-md border">
                    <div className="p-2">
                    {incomeCategories.map(category => (
                        <div key={category.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <span className="text-sm font-medium">{category.name}</span>
                            {!category.isDefault ? (
                               <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the "{category.name}" category.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteIncomeCategory(category.id, category.name)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <span className="text-xs text-muted-foreground pr-2">Default</span>
                            )}
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>

         <Card className="md:col-span-2">
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
