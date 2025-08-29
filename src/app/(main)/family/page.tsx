'use client';

import Image from 'next/image';
import PageHeader from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { familyMembers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle, User } from 'lucide-react';
import Link from 'next/link';

export default function FamilyPage() {
  return (
    <div className="container mx-auto">
      <PageHeader title="Family Profiles" subtitle="Manage your family's information.">
        <div className="flex items-center gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Member
          </Button>
          <Button variant="outline" asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-0 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                 <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                  data-ai-hint="profile picture"
                />
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>Age: {member.age}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold text-sm">Health Conditions:</h4>
                  <p className="text-sm text-muted-foreground">{member.healthConditions}</p>
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold text-sm">Dietary Restrictions:</h4>
                  <p className="text-sm text-muted-foreground">{member.dietaryRestrictions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
