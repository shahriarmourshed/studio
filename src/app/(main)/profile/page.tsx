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

export default function ProfilePage() {
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
