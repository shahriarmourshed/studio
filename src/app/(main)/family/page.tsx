'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import type { FamilyMember } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FamilyPage() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberHealth, setNewMemberHealth] = useState('');
  const [newMemberDiet, setNewMemberDiet] = useState('');

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, 'users', user.uid, 'familyMembers'),
        (snapshot) => {
          const membersData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as FamilyMember)
          );
          setFamilyMembers(membersData);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [user]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && newMemberName && newMemberAge) {
      const newMember: Omit<FamilyMember, 'id' | 'avatarUrl'> = {
        name: newMemberName,
        age: parseInt(newMemberAge, 10),
        healthConditions: newMemberHealth,
        dietaryRestrictions: newMemberDiet,
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'familyMembers'), newMember);
      await setDoc(doc(db, 'users', user.uid, 'familyMembers', docRef.id), { 
        ...newMember, 
        id: docRef.id,
        avatarUrl: `https://picsum.photos/100/100?random=${Math.random()}`
      });

      // Reset form
      setNewMemberName('');
      setNewMemberAge('');
      setNewMemberHealth('');
      setNewMemberDiet('');
    }
  };


  if (loading) {
    return <div>Loading family members...</div>;
  }

  return (
    <div className="container mx-auto">
      <PageHeader title="Family Profiles" subtitle="Manage your family's information.">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Family Member</DialogTitle>
              <DialogDescription>Enter the details of the new family member.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">Age</Label>
                  <Input id="age" type="number" value={newMemberAge} onChange={(e) => setNewMemberAge(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="health" className="text-right">Health Conditions</Label>
                  <Input id="health" value={newMemberHealth} onChange={(e) => setNewMemberHealth(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="diet" className="text-right">Dietary Restrictions</Label>
                  <Input id="diet" value={newMemberDiet} onChange={(e) => setNewMemberDiet(e.target.value)} className="col-span-3" />
                </div>
                <Button type="submit" className="w-full">Save Member</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
