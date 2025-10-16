
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
  DialogFooter,
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
import { PlusCircle, Edit, Trash2, ShieldAlert, Gift } from "lucide-react";
import Image from 'next/image';
import { useData } from '@/context/data-context';
import type { FamilyMember } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import avatars from '@/lib/placeholder-avatars.json';
import { format, differenceInYears, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function FamilyPage() {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember, clearFamilyMembers } = useData();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Add form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBirthday, setNewMemberBirthday] = useState('');
  const [newMemberHeightFeet, setNewMemberHeightFeet] = useState('');
  const [newMemberHeightInches, setNewMemberHeightInches] = useState('');
  const [newMemberWeight, setNewMemberWeight] = useState('');
  const [newMemberHealth, setNewMemberHealth] = useState('');
  const [newMemberDiet, setNewMemberDiet] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  // Edit form state
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberBirthday, setEditMemberBirthday] = useState('');
  const [editMemberHeightFeet, setEditMemberHeightFeet] = useState('');
  const [editMemberHeightInches, setEditMemberHeightInches] = useState('');
  const [editMemberWeight, setEditMemberWeight] = useState('');
  const [editMemberHealth, setEditMemberHealth] = useState('');
  const [editMemberDiet, setEditMemberDiet] = useState('');
  const [editMemberAvatar, setEditMemberAvatar] = useState('');
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName && newMemberBirthday && newMemberHeightFeet && newMemberWeight) {
      let finalAvatarUrl = newMemberAvatar;
      if (!finalAvatarUrl) {
        const randomIndex = Math.floor(Math.random() * avatars.avatars.length);
        finalAvatarUrl = avatars.avatars[randomIndex].url;
      }
      
      const heightInInches = (parseInt(newMemberHeightFeet) * 12) + parseInt(newMemberHeightInches || '0');

      await addFamilyMember({
        name: newMemberName,
        birthday: newMemberBirthday,
        height: heightInInches,
        weight: parseInt(newMemberWeight),
        healthConditions: newMemberHealth,
        dietaryRestrictions: newMemberDiet,
        avatarUrl: finalAvatarUrl,
        specialEventName: newEventName,
        specialEventDate: newEventDate,
      });
      resetAddForm();
    }
  };

  const resetAddForm = () => {
    setNewMemberName('');
    setNewMemberBirthday('');
    setNewMemberHeightFeet('');
    setNewMemberHeightInches('');
    setNewMemberWeight('');
    setNewMemberHealth('');
    setNewMemberDiet('');
    setNewMemberAvatar('');
    setNewEventName('');
    setNewEventDate('');
    setIsAddDialogOpen(false);
  }

  const handleEditClick = (member: FamilyMember) => {
    setSelectedMember(member);
    setEditMemberName(member.name);
    setEditMemberBirthday(member.birthday);
    setEditMemberHeightFeet(String(Math.floor(member.height / 12)));
    setEditMemberHeightInches(String(member.height % 12));
    setEditMemberWeight(String(member.weight));
    setEditMemberHealth(member.healthConditions);
    setEditMemberDiet(member.dietaryRestrictions);
    setEditMemberAvatar(member.avatarUrl);
    setEditEventName(member.specialEventName || '');
    setEditEventDate(member.specialEventDate || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember && editMemberBirthday) {
      const heightInInches = (parseInt(editMemberHeightFeet) * 12) + parseInt(editMemberHeightInches || '0');
      updateFamilyMember({
        ...selectedMember,
        name: editMemberName,
        birthday: editMemberBirthday,
        height: heightInInches,
        weight: parseInt(editMemberWeight),
        healthConditions: editMemberHealth,
        dietaryRestrictions: editMemberDiet,
        avatarUrl: editMemberAvatar,
        specialEventName: editEventName,
        specialEventDate: editEventDate,
      });
      setIsEditDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    deleteFamilyMember(memberId);
  }
  
  const handleClearAll = async () => {
    await clearFamilyMembers();
    toast({
        title: "Success",
        description: "All family members have been deleted.",
    })
  }

  const calculateAge = (birthday: string) => {
    try {
        if (!birthday) return 'N/A';
        return differenceInYears(new Date(), parseISO(birthday));
    } catch (error) {
        return 'N/A'
    }
  };

  const formatHeight = (totalInches: number) => {
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}' ${inches}"`;
  }

  return (
    <div className="container mx-auto">
      <PageHeader title="Family Members" subtitle="Manage your family's profiles.">
        <div className="flex items-center gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <ShieldAlert className="mr-2 h-4 w-4"/>
                        Clear All
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all family members from your database. This is a one-time action to clean up persistent demo data.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                  <DialogDescription>
                      Enter the details of the new family member.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="flex-1 overflow-y-auto">
                    <div className="grid gap-4 py-4 px-1">
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-left sm:text-right">Name</Label>
                        <Input id="name" placeholder="e.g., John Doe" className="col-span-1 sm:col-span-3" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="birthday" className="text-left sm:text-right">Birthday</Label>
                            <Input
                                id="birthday"
                                type="date"
                                className="col-span-1 sm:col-span-3"
                                value={newMemberBirthday}
                                onChange={e => setNewMemberBirthday(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="height-feet" className="text-left sm:text-right">Height</Label>
                            <div className="col-span-1 sm:col-span-3 grid grid-cols-2 gap-2">
                                <Input id="height-feet" type="number" placeholder="Feet" value={newMemberHeightFeet} onChange={e => setNewMemberHeightFeet(e.target.value)} required />
                                <Input id="height-inches" type="number" placeholder="Inches" value={newMemberHeightInches} onChange={e => setNewMemberHeightInches(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="weight" className="text-left sm:text-right">Weight (kg)</Label>
                            <Input id="weight" type="number" placeholder="e.g., 70" className="col-span-1 sm:col-span-3" value={newMemberWeight} onChange={e => setNewMemberWeight(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                          <Label className="text-left sm:text-right pt-2">Avatar</Label>
                          <div className="col-span-1 sm:col-span-3">
                              <div className="grid grid-cols-5 gap-2 mb-2">
                                  {avatars.avatars.map(avatar => (
                                      <button
                                          type="button"
                                          key={avatar.id}
                                          onClick={() => setNewMemberAvatar(avatar.url)}
                                          className={cn("rounded-full border-2 p-0.5", newMemberAvatar === avatar.url ? "border-primary" : "border-transparent hover:border-primary/50")}
                                      >
                                          <Image src={avatar.url} alt={avatar.hint} width={48} height={48} className="rounded-full" data-ai-hint={avatar.hint} />
                                      </button>
                                  ))}
                              </div>
                              <Label htmlFor="avatar-url" className="text-xs text-muted-foreground">Or paste an image URL</Label>
                              <Input id="avatar-url" placeholder="https://..." className="mt-1" value={newMemberAvatar} onChange={e => setNewMemberAvatar(e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                        <Label htmlFor="health" className="text-left sm:text-right pt-2">Health Conditions</Label>
                        <Textarea id="health" placeholder="e.g., High blood pressure" className="col-span-1 sm:col-span-3" value={newMemberHealth} onChange={e => setNewMemberHealth(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                        <Label htmlFor="diet" className="text-left sm:text-right pt-2">Dietary Restrictions</Label>
                        <Textarea id="diet" placeholder="e.g., Vegetarian, nut allergy" className="col-span-1 sm:col-span-3" value={newMemberDiet} onChange={e => setNewMemberDiet(e.target.value)} />
                        </div>
                        <Separator className="my-2" />
                         <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="event-name" className="text-left sm:text-right">Special Event Name</Label>
                            <Input id="event-name" placeholder="e.g., Anniversary" className="col-span-1 sm:col-span-3" value={newEventName} onChange={e => setNewEventName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="event-date" className="text-left sm:text-right">Special Event Date</Label>
                            <Input id="event-date" type="date" className="col-span-1 sm:col-span-3" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
                        </div>
                    </div>
                  <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                    <Button type="submit" className="w-full">Save Member</Button>
                  </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </PageHeader>
      
      <div className="px-4 sm:px-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="flex flex-row items-start gap-4">
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>Age: {calculateAge(member.birthday)} &bull; {formatHeight(member.height)} &bull; {member.weight}kg</CardDescription>
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
                {member.specialEventName && member.specialEventDate && (
                    <div className="mt-2 pt-2 border-t">
                        <h4 className="font-semibold flex items-center gap-2"><Gift className="w-4 h-4 text-primary" /> Special Event</h4>
                        <p className="text-sm text-muted-foreground">{member.specialEventName} on {format(parseISO(member.specialEventDate), 'MMMM do')}</p>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

       {selectedMember && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Family Member</DialogTitle>
              <DialogDescription>Update the details of {selectedMember.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateMember} className="flex-1 overflow-y-auto">
              <div className="grid gap-4 py-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-left sm:text-right">Name</Label>
                  <Input id="edit-name" className="col-span-1 sm:col-span-3" value={editMemberName} onChange={e => setEditMemberName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-birthday" className="text-left sm:text-right">Birthday</Label>
                     <Input
                        id="edit-birthday"
                        type="date"
                        className="col-span-1 sm:col-span-3"
                        value={editMemberBirthday}
                        onChange={e => setEditMemberBirthday(e.target.value)}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-height-feet" className="text-left sm:text-right">Height</Label>
                    <div className="col-span-1 sm:col-span-3 grid grid-cols-2 gap-2">
                        <Input id="edit-height-feet" type="number" placeholder="Feet" value={editMemberHeightFeet} onChange={e => setEditMemberHeightFeet(e.target.value)} required />
                        <Input id="edit-height-inches" type="number" placeholder="Inches" value={editMemberHeightInches} onChange={e => setEditMemberHeightInches(e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-weight" className="text-left sm:text-right">Weight (kg)</Label>
                     <Input id="edit-weight" type="number" placeholder="e.g., 70" className="col-span-1 sm:col-span-3" value={editMemberWeight} onChange={e => setEditMemberWeight(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                  <Label className="text-left sm:text-right pt-2">Avatar</Label>
                  <div className="col-span-1 sm:col-span-3">
                      <div className="grid grid-cols-5 gap-2 mb-2">
                          {avatars.avatars.map(avatar => (
                              <button
                                  type="button"
                                  key={avatar.id}
                                  onClick={() => setEditMemberAvatar(avatar.url)}
                                  className={cn("rounded-full border-2 p-0.5", editMemberAvatar === avatar.url ? "border-primary" : "border-transparent hover:border-primary/50")}
                              >
                                  <Image src={avatar.url} alt={avatar.hint} width={48} height={48} className="rounded-full" data-ai-hint={avatar.hint} />
                              </button>
                          ))}
                      </div>
                      <Label htmlFor="edit-avatar-url" className="text-xs text-muted-foreground">Or paste an image URL</Label>
                      <Input id="edit-avatar-url" placeholder="https://..." className="mt-1" value={editMemberAvatar} onChange={e => setEditMemberAvatar(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-health" className="text-left sm:text-right pt-2">Health Conditions</Label>
                  <Textarea id="edit-health" className="col-span-1 sm:col-span-3" value={editMemberHealth} onChange={e => setEditMemberHealth(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-diet" className="text-left sm:text-right pt-2">Dietary Restrictions</Label>
                  <Textarea id="edit-diet" className="col-span-1 sm:col-span-3" value={editMemberDiet} onChange={e => setEditMemberDiet(e.target.value)} />
                </div>
                 <Separator className="my-2" />
                 <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-event-name" className="text-left sm:text-right">Special Event Name</Label>
                    <Input id="edit-event-name" placeholder="e.g., Anniversary" className="col-span-1 sm:col-span-3" value={editEventName} onChange={e => setEditEventName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-event-date" className="text-left sm:text-right">Special Event Date</Label>
                    <Input id="edit-event-date" type="date" className="col-span-1 sm:col-span-3" value={editEventDate} onChange={e => setEditEventDate(e.target.value)} />
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                <Button type="submit" className="w-full">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

    
