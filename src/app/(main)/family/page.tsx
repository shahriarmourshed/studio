'use client';
import { useState } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useData } from '@/context/data-context';
import type { FamilyMember } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FamilyPage() {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useData();
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberHealth, setNewMemberHealth] = useState('');
  const [newMemberDiet, setNewMemberDiet] = useState('');
  const [newMemberAvatarUrl, setNewMemberAvatarUrl] = useState('');

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberAge, setEditMemberAge] = useState('');
  const [editMemberHealth, setEditMemberHealth] = useState('');
  const [editMemberDiet, setEditMemberDiet] = useState('');
  const [editMemberAvatarUrl, setEditMemberAvatarUrl] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName && newMemberAge) {
      const newMember: Omit<FamilyMember, 'id'> = {
        name: newMemberName,
        age: parseInt(newMemberAge, 10),
        healthConditions: newMemberHealth,
        dietaryRestrictions: newMemberDiet,
        avatarUrl: newMemberAvatarUrl,
      };
      await addFamilyMember(newMember);
      resetAddForm();
    }
  };

  const resetAddForm = () => {
    setNewMemberName('');
    setNewMemberAge('');
    setNewMemberHealth('');
    setNewMemberDiet('');
    setNewMemberAvatarUrl('');
    setIsAddDialogOpen(false);
  }

  const handleEditClick = (member: FamilyMember) => {
    setSelectedMember(member);
    setEditMemberName(member.name);
    setEditMemberAge(String(member.age));
    setEditMemberHealth(member.healthConditions);
    setEditMemberDiet(member.dietaryRestrictions);
    setEditMemberAvatarUrl(member.avatarUrl);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      updateFamilyMember({
        ...selectedMember,
        name: editMemberName,
        age: parseInt(editMemberAge, 10),
        healthConditions: editMemberHealth,
        dietaryRestrictions: editMemberDiet,
        avatarUrl: editMemberAvatarUrl,
      });
      setIsEditDialogOpen(false);
      setSelectedMember(null);
    }
  };

  return (
    <div className="container mx-auto">
      <PageHeader title="Family Profiles" subtitle="Manage your family's information.">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
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
                  <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
                  <Input id="avatarUrl" value={newMemberAvatarUrl} onChange={(e) => setNewMemberAvatarUrl(e.target.value)} className="col-span-3" placeholder="https://example.com/image.png" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="health" className="text-right">Health Conditions</Label>
                  <Input id="health" value={newMemberHealth} onChange={(e) => setNewMemberHealth(e.target.value)} className="col-span-3" placeholder="e.g. High cholesterol" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="diet" className="text-right">Dietary Restrictions</Label>
                  <Input id="diet" value={newMemberDiet} onChange={(e) => setNewMemberDiet(e.target.value)} className="col-span-3" placeholder="e.g. Vegetarian, No peanuts" />
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
              <CardHeader className="flex flex-row items-start gap-4">
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                  data-ai-hint="profile picture"
                />
                <div className="flex-1">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>Age: {member.age}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold text-sm">Health Conditions:</h4>
                  <p className="text-sm text-muted-foreground">{member.healthConditions || 'None'}</p>
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold text-sm">Dietary Restrictions:</h4>
                  <p className="text-sm text-muted-foreground">{member.dietaryRestrictions || 'None'}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="ghost" size="icon" onClick={() => handleEditClick(member)}>
                    <Edit className="h-4 w-4"/>
                    <span className="sr-only">Edit</span>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive"/>
                            <span className="sr-only">Delete</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {member.name}'s profile.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteFamilyMember(member.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

       {selectedMember && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Family Member</DialogTitle>
              <DialogDescription>Update the details for {selectedMember.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateMember}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input id="edit-name" value={editMemberName} onChange={(e) => setEditMemberName(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-age" className="text-right">Age</Label>
                  <Input id="edit-age" type="number" value={editMemberAge} onChange={(e) => setEditMemberAge(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-avatarUrl" className="text-right">Avatar URL</Label>
                  <Input id="edit-avatarUrl" value={editMemberAvatarUrl} onChange={(e) => setEditMemberAvatarUrl(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-health" className="text-right">Health Conditions</Label>
                  <Input id="edit-health" value={editMemberHealth} onChange={(e) => setEditMemberHealth(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-diet" className="text-right">Dietary Restrictions</Label>
                  <Input id="edit-diet" value={editMemberDiet} onChange={(e) => setEditMemberDiet(e.target.value)} className="col-span-3" />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
