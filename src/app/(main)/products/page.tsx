'use client';
import { useState, useEffect } from 'react';
import PageHeader from "@/components/common/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, onSnapshot, query } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { format } from 'date-fns';

export default function ProductsPage() {
  const { getSymbol, convert } = useCurrency();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newProductName, setNewProductName] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [newProductUnit, setNewProductUnit] = useState<Product['unit']>('kg');
  const [newProductPrice, setNewProductPrice] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'users', user.uid, 'products'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    }, (error) => {
      console.error("Error fetching products:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && newProductName && newProductQuantity && newProductPrice) {
      const newProduct: Omit<Product, 'id'> = {
        name: newProductName,
        quantity: parseFloat(newProductQuantity),
        unit: newProductUnit,
        price: parseFloat(newProductPrice),
        lastUpdated: format(new Date(), 'yyyy-MM-dd'),
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'products'), newProduct);
      await setDoc(doc(db, 'users', user.uid, 'products', docRef.id), { ...newProduct, id: docRef.id }, { merge: true });

      // Reset form and close dialog
      setNewProductName('');
      setNewProductQuantity('');
      setNewProductUnit('kg');
      setNewProductPrice('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto">
      <PageHeader title="Product Needs" subtitle="Manage your monthly essentials.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Product</DialogTitle>
              <DialogDescription>
                Enter the details of the new product you need to track.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" placeholder="e.g., Basmati Rice" className="col-span-3" value={newProductName} onChange={e => setNewProductName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                <Input id="quantity" type="number" placeholder="e.g., 25" className="col-span-3" value={newProductQuantity} onChange={e => setNewProductQuantity(e.target.value)} required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">Unit</Label>
                <Select value={newProductUnit} onValueChange={(value: Product['unit']) => setNewProductUnit(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="pack">pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price ({getSymbol()})</Label>
                <Input id="price" type="number" placeholder="e.g., 2500" className="col-span-3" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Save Product</Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <div className="px-4 sm:px-0">
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-center">
                      {product.quantity} <Badge variant="secondary">{product.unit}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{getSymbol()}{convert(product.price).toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{product.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
