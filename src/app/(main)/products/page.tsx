'use client';
import { useState } from 'react';
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { useData } from '@/context/data-context';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const { getSymbol, convert } = useCurrency();
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [newProductUnit, setNewProductUnit] = useState<Product['unit']>('kg');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDailyNeed, setNewProductDailyNeed] = useState('');
  const [newProductMonthlyNeed, setNewProductMonthlyNeed] = useState('');
  const [newProductHalfMonthlyNeed, setNewProductHalfMonthlyNeed] = useState('');

  // Edit form state
  const [editProductName, setEditProductName] = useState('');
  const [editProductQuantity, setEditProductQuantity] = useState('');
  const [editProductUnit, setEditProductUnit] = useState<Product['unit']>('kg');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductDailyNeed, setEditProductDailyNeed] = useState('');
  const [editProductMonthlyNeed, setEditProductMonthlyNeed] = useState('');
  const [editProductHalfMonthlyNeed, setEditProductHalfMonthlyNeed] = useState('');


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductName && newProductQuantity && newProductPrice) {
      addProduct({
        name: newProductName,
        quantity: parseFloat(newProductQuantity),
        unit: newProductUnit,
        price: parseFloat(newProductPrice),
        dailyNeed: newProductDailyNeed ? parseFloat(newProductDailyNeed) : undefined,
        monthlyNeed: newProductMonthlyNeed ? parseFloat(newProductMonthlyNeed) : undefined,
        halfMonthlyNeed: newProductHalfMonthlyNeed ? parseFloat(newProductHalfMonthlyNeed) : undefined,
      });
      resetAddForm();
    }
  };
  
  const resetAddForm = () => {
      setNewProductName('');
      setNewProductQuantity('');
      setNewProductUnit('kg');
      setNewProductPrice('');
      setNewProductDailyNeed('');
      setNewProductMonthlyNeed('');
      setNewProductHalfMonthlyNeed('');
      setIsAddDialogOpen(false);
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductName(product.name);
    setEditProductQuantity(String(product.quantity));
    setEditProductUnit(product.unit);
    setEditProductPrice(String(product.price));
    setEditProductDailyNeed(product.dailyNeed?.toString() ?? '');
    setEditProductMonthlyNeed(product.monthlyNeed?.toString() ?? '');
    setEditProductHalfMonthlyNeed(product.halfMonthlyNeed?.toString() ?? '');
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && editProductName && editProductQuantity && editProductPrice) {
        const updatedProduct: Product = {
            ...selectedProduct,
            name: editProductName,
            quantity: parseFloat(editProductQuantity),
            unit: editProductUnit,
            price: parseFloat(editProductPrice),
            dailyNeed: editProductDailyNeed ? parseFloat(editProductDailyNeed) : undefined,
            monthlyNeed: editProductMonthlyNeed ? parseFloat(editProductMonthlyNeed) : undefined,
            halfMonthlyNeed: editProductHalfMonthlyNeed ? parseFloat(editProductHalfMonthlyNeed) : undefined,
        };
        updateProduct(updatedProduct);
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
    }
  };

  const handleDeleteProduct = (productId: string) => {
      deleteProduct(productId);
  }

  return (
    <div className="container mx-auto">
      <PageHeader title="Product Needs" subtitle="Manage your monthly essentials.">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
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
                    <SelectItem value="dozen">dozen</SelectItem>
                    <SelectItem value="box">box</SelectItem>
                    <SelectItem value="bottle">bottle</SelectItem>
                    <SelectItem value="can">can</SelectItem>
                    <SelectItem value="roll">roll</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price ({getSymbol()})</Label>
                <Input id="price" type="number" placeholder="e.g., 2500" className="col-span-3" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dailyNeed" className="text-right">Daily Need</Label>
                <Input id="dailyNeed" type="number" placeholder="(Optional)" className="col-span-3" value={newProductDailyNeed} onChange={e => setNewProductDailyNeed(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monthlyNeed" className="text-right">Monthly Need</Label>
                <Input id="monthlyNeed" type="number" placeholder="(Optional)" className="col-span-3" value={newProductMonthlyNeed} onChange={e => setNewProductMonthlyNeed(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="halfMonthlyNeed" className="text-right">Half-monthly Need</Label>
                <Input id="halfMonthlyNeed" type="number" placeholder="(Optional)" className="col-span-3" value={newProductHalfMonthlyNeed} onChange={e => setNewProductHalfMonthlyNeed(e.target.value)} />
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
                  <TableHead className="text-center">Daily Need</TableHead>
                  <TableHead className="text-center">Half-monthly</TableHead>
                  <TableHead className="text-center">Monthly Need</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-center">
                      {product.quantity} <Badge variant="secondary">{product.unit}</Badge>
                    </TableCell>
                     <TableCell className="text-center">{product.dailyNeed ?? 'N/A'}</TableCell>
                    <TableCell className="text-center">{product.halfMonthlyNeed ?? 'N/A'}</TableCell>
                    <TableCell className="text-center">{product.monthlyNeed ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">{getSymbol()}{convert(product.price).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(product)}>
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
                                        This action cannot be undone. This will permanently delete the product from your list.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the details of your product.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" className="col-span-3" value={editProductName} onChange={e => setEditProductName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
                <Input id="edit-quantity" type="number" className="col-span-3" value={editProductQuantity} onChange={e => setEditProductQuantity(e.target.value)} required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-right">Unit</Label>
                <Select value={editProductUnit} onValueChange={(value: Product['unit']) => setEditProductUnit(value)}>
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
                    <SelectItem value="dozen">dozen</SelectItem>
                    <SelectItem value="box">box</SelectItem>
                    <SelectItem value="bottle">bottle</SelectItem>
                    <SelectItem value="can">can</SelectItem>
                    <SelectItem value="roll">roll</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Price ({getSymbol()})</Label>
                <Input id="edit-price" type="number" className="col-span-3" value={editProductPrice} onChange={e => setEditProductPrice(e.target.value)} required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-dailyNeed" className="text-right">Daily Need</Label>
                <Input id="edit-dailyNeed" type="number" placeholder="(Optional)" className="col-span-3" value={editProductDailyNeed} onChange={e => setEditProductDailyNeed(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-monthlyNeed" className="text-right">Monthly Need</Label>
                <Input id="edit-monthlyNeed" type="number" placeholder="(Optional)" className="col-span-3" value={editProductMonthlyNeed} onChange={e => setEditProductMonthlyNeed(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-halfMonthlyNeed" className="text-right">Half-monthly Need</Label>
                <Input id="edit-halfMonthlyNeed" type="number" placeholder="(Optional)" className="col-span-3" value={editProductHalfMonthlyNeed} onChange={e => setEditProductHalfMonthlyNeed(e.target.value)} />
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
