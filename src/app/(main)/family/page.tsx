
'use client';

import { useState } from 'react';
import PageHeader from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Image from 'next/image';
import { useData } from '@/context/data-context';
import type { FamilyMember } from '@/lib/types';

export default function FamilyPage() {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Add form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberHealth, setNewMemberHealth] = useState('');
  const [newMemberDiet, setNewMemberDiet] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('');

  // Edit form state
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberAge, setEditMemberAge] = useState('');
  const [editMemberHealth, setEditMemberHealth] = useState('');
  const [editMemberDiet, setEditMemberDiet] = useState('');
  const [editMemberAvatar, setEditMemberAvatar] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName && newMemberAge) {
      await addFamilyMember({
        name: newMemberName,
        age: parseInt(newMemberAge),
        healthConditions: newMemberHealth,
        dietaryRestrictions: newMemberDiet,
        avatarUrl: newMemberAvatar || `https://i.pravatar.cc/150?u=${newMemberName}`
      });
      resetAddForm();
    }
  };

  const resetAddForm = () => {
    setNewMemberName('');
    setNewMemberAge('');
    setNewMemberHealth('');
    setNewMemberDiet('');
    setNewMemberAvatar('');
    setIsAddDialogOpen(false);
  }

  const handleEditClick = (member: FamilyMember) => {
    setSelectedMember(member);
    setEditMemberName(member.name);
    setEditMemberAge(String(member.age));
    setEditMemberHealth(member.healthConditions);
    setEditMemberDiet(member.dietaryRestrictions);
    setEditMemberAvatar(member.avatarUrl);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      updateFamilyMember({
        ...selectedMember,
        name: editMemberName,
        age: parseInt(editMemberAge),
        healthConditions: editMemberHealth,
        dietaryRestrictions: editMemberDiet,
        avatarUrl: editMemberAvatar,
      });
      setIsEditDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    deleteFamilyMember(memberId);
  }

  return (
    <div className="container mx-auto">
      <PageHeader title="Family Members" subtitle="Manage your family's profiles.">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
              <DialogDescription>
                Enter the details of the new family member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" placeholder="e.g., John Doe" className="col-span-3" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">Age</Label>
                  <Input id="age" type="number" placeholder="e.g., 34" className="col-span-3" value={newMemberAge} onChange={e => setNewMemberAge(e.target.value)} required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avatar" className="text-right">Avatar URL</Label>
                  <Input id="avatar" placeholder="https://..." className="col-span-3" value={newMemberAvatar} onChange={e => setNewMemberAvatar(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="health" className="text-right pt-2">Health Conditions</Label>
                  <Textarea id="health" placeholder="e.g., High blood pressure" className="col-span-3" value={newMemberHealth} onChange={e => setNewMemberHealth(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="diet" className="text-right pt-2">Dietary Restrictions</Label>
                  <Textarea id="diet" placeholder="e.g., Vegetarian, nut allergy" className="col-span-3" value={newMemberDiet} onChange={e => setNewMemberDiet(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Save Member</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <div className="px-4 sm:px-0">
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
                />
                <div className="flex-1">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>Age: {member.age}</CardDescription>
                </div>
                <div className="flex gap-1">
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
                                This action cannot be undone. This will permanently delete this family member.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold">Health Conditions</h4>
                  <p className="text-sm text-muted-foreground">{member.healthConditions || 'None specified'}</p>
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold">Dietary Restrictions</h4>
                  <p className="text-sm text-muted-foreground">{member.dietaryRestrictions || 'None specified'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

       {selectedMember && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Family Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateMember}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input id="edit-name" className="col-span-3" value={editMemberName} onChange={e => setEditMemberName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-age" className="text-right">Age</Label>
                  <Input id="edit-age" type="number" className="col-span-3" value={editMemberAge} onChange={e => setEditMemberAge(e.target.value)} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-avatar" className="text-right">Avatar URL</Label>
                  <Input id="edit-avatar" className="col-span-3" value={editMemberAvatar} onChange={e => setEditMemberAvatar(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-health" className="text-right pt-2">Health Conditions</Label>
                  <Textarea id="edit-health" className="col-span-3" value={editMemberHealth} onChange={e => setEditMemberHealth(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-diet" className="text-right pt-2">Dietary Restrictions</Label>
                  <Textarea id="edit-diet" className="col-span-3" value={editMemberDiet} onChange={e => setEditMemberDiet(e.target.value)} />
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
