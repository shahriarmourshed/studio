
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Edit, Trash2, ShieldAlert } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { useData } from '@/context/data-context';
import type { Product } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const { getSymbol, convert } = useCurrency();
  const { products, addProduct, updateProduct, deleteProduct, clearProducts } = useData();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [newProductCurrentStock, setNewProductCurrentStock] = useState('');
  const [newProductUnit, setNewProductUnit] = useState<Product['unit']>('kg');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductPurchaseDate, setNewProductPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newProductConsumptionRate, setNewProductConsumptionRate] = useState('');
  const [newProductConsumptionPeriod, setNewProductConsumptionPeriod] = useState<Product['consumptionPeriod']>('daily');
  const [newProductLowStockThreshold, setNewProductLowStockThreshold] = useState('');
  
  // Edit form state
  const [editProductName, setEditProductName] = useState('');
  const [editProductQuantity, setEditProductQuantity] = useState('');
  const [editProductCurrentStock, setEditProductCurrentStock] = useState('');
  const [editProductUnit, setEditProductUnit] = useState<Product['unit']>('kg');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductPurchaseDate, setEditProductPurchaseDate] = useState('');
  const [editProductConsumptionRate, setEditProductConsumptionRate] = useState('');
  const [editProductConsumptionPeriod, setEditProductConsumptionPeriod] = useState<Product['consumptionPeriod']>('daily');
  const [editProductLowStockThreshold, setEditProductLowStockThreshold] = useState('');


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductName && newProductQuantity && newProductCurrentStock && newProductPrice) {
      await addProduct({
        name: newProductName,
        quantity: parseFloat(newProductQuantity),
        currentStock: parseFloat(newProductCurrentStock),
        unit: newProductUnit,
        price: parseFloat(newProductPrice),
        purchaseDate: newProductPurchaseDate,
        consumptionRate: newProductConsumptionRate ? parseFloat(newProductConsumptionRate) : undefined,
        consumptionPeriod: newProductConsumptionRate ? newProductConsumptionPeriod : undefined,
        lowStockThreshold: newProductLowStockThreshold ? parseFloat(newProductLowStockThreshold) : undefined,
      });
      resetAddForm();
    }
  };
  
  const resetAddForm = () => {
      setNewProductName('');
      setNewProductQuantity('');
      setNewProductCurrentStock('');
      setNewProductUnit('kg');
      setNewProductPrice('');
      setNewProductPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
      setNewProductConsumptionRate('');
      setNewProductConsumptionPeriod('daily');
      setNewProductLowStockThreshold('');
      setIsAddDialogOpen(false);
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductName(product.name);
    setEditProductQuantity(String(product.quantity));
    setEditProductCurrentStock(String(product.currentStock));
    setEditProductUnit(product.unit);
    setEditProductPrice(String(product.price));
    setEditProductPurchaseDate(product.purchaseDate);
    setEditProductConsumptionRate(product.consumptionRate?.toString() ?? '');
    setEditProductConsumptionPeriod(product.consumptionPeriod ?? 'daily');
    setEditProductLowStockThreshold(product.lowStockThreshold?.toString() ?? '');
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && editProductName && editProductQuantity && editProductCurrentStock && editProductPrice) {
        const updatedProduct: Product = {
            ...selectedProduct,
            name: editProductName,
            quantity: parseFloat(editProductQuantity),
            currentStock: parseFloat(editProductCurrentStock),
            unit: editProductUnit,
            price: parseFloat(editProductPrice),
            purchaseDate: editProductPurchaseDate,
            consumptionRate: editProductConsumptionRate ? parseFloat(editProductConsumptionRate) : undefined,
            consumptionPeriod: editProductConsumptionRate ? editProductConsumptionPeriod : undefined,
            lowStockThreshold: editProductLowStockThreshold ? parseFloat(editProductLowStockThreshold) : undefined,
        };
        updateProduct(updatedProduct);
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
    }
  };

  const handleDeleteProduct = (productId: string) => {
      deleteProduct(productId);
  }
  
  const renderConsumptionInfo = (product: Product) => {
    if (product.consumptionRate && product.consumptionPeriod) {
      return `${product.consumptionRate} ${product.unit} / ${product.consumptionPeriod.charAt(0).toUpperCase() + product.consumptionPeriod.slice(1)}`;
    }
    return 'N/A';
  }

  const handleClearAll = async () => {
    await clearProducts();
    toast({
        title: "Success",
        description: "All products have been deleted.",
    })
  }

  return (
    <div className="container mx-auto">
      <PageHeader title="Product Needs" subtitle="Manage your monthly essentials.">
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
                        This action cannot be undone. This will permanently delete all products from your database.
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
                Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                <DialogTitle>Add a New Product</DialogTitle>
                <DialogDescription>
                    Enter the details of the new product you need to track.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct}>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-left sm:text-right">Name</Label>
                    <Input id="name" placeholder="e.g., Basmati Rice" className="col-span-1 sm:col-span-3" value={newProductName} onChange={e => setNewProductName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-left sm:text-right">Purchased</Label>
                    <Input id="quantity" type="number" placeholder="e.g., 25" className="col-span-1 sm:col-span-3" value={newProductQuantity} onChange={e => setNewProductQuantity(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="currentStock" className="text-left sm:text-right">Current Stock</Label>
                    <Input id="currentStock" type="number" placeholder="e.g., 20" className="col-span-1 sm:col-span-3" value={newProductCurrentStock} onChange={e => setNewProductCurrentStock(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-left sm:text-right">Unit</Label>
                    <Select value={newProductUnit} onValueChange={(value: Product['unit']) => setNewProductUnit(value)}>
                    <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <ScrollArea className="h-48">
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
                        </ScrollArea>
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-left sm:text-right">Price ({getSymbol()})</Label>
                    <Input id="price" type="number" placeholder="e.g., 2500" className="col-span-1 sm:col-span-3" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="purchaseDate" className="text-left sm:text-right">Purchase Date</Label>
                    <Input id="purchaseDate" type="date" className="col-span-1 sm:col-span-3" value={newProductPurchaseDate} onChange={e => setNewProductPurchaseDate(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label className="text-left sm:text-right">Consumption</Label>
                    <div className="col-span-1 sm:col-span-3 grid grid-cols-2 gap-2">
                        <Select value={newProductConsumptionPeriod} onValueChange={(v) => setNewProductConsumptionPeriod(v as Product['consumptionPeriod'])}>
                            <SelectTrigger>
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="half-monthly">Half-monthly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <Input id="consumptionRate" type="number" placeholder="Amount" className="pr-12" value={newProductConsumptionRate} onChange={e => setNewProductConsumptionRate(e.target.value)} />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">{newProductUnit}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="lowStockThreshold" className="text-left sm:text-right">Low Stock Alert</Label>
                    <div className="col-span-1 sm:col-span-3 relative">
                         <Input id="lowStockThreshold" type="number" placeholder="e.g., 5" className="pr-12" value={newProductLowStockThreshold} onChange={e => setNewProductLowStockThreshold(e.target.value)} />
                         <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">{newProductUnit}</span>
                    </div>
                </div>
                
                <Button type="submit" className="w-full">Save Product</Button>
                </div>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </PageHeader>
      
      <div className="px-4 sm:px-0">
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Last Purchase</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Purchase Date</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Consumption</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-center">
                      {product.currentStock.toFixed(2)} <Badge variant="outline">{product.unit}</Badge>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      {product.quantity} <Badge variant="secondary">{product.unit}</Badge>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">{product.purchaseDate}</TableCell>
                     <TableCell className="text-center hidden lg:table-cell">{renderConsumptionInfo(product)}</TableCell>
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the details of your product.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-left sm:text-right">Name</Label>
                <Input id="edit-name" className="col-span-1 sm:col-span-3" value={editProductName} onChange={e => setEditProductName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-left sm:text-right">Last Purchase</Label>
                <Input id="edit-quantity" type="number" className="col-span-1 sm:col-span-3" value={editProductQuantity} onChange={e => setEditProductQuantity(e.target.value)} required/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-currentStock" className="text-left sm:text-right">Current Stock</Label>
                <Input id="edit-currentStock" type="number" className="col-span-1 sm:col-span-3" value={editProductCurrentStock} onChange={e => setEditProductCurrentStock(e.target.value)} required/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-left sm:text-right">Unit</Label>
                <Select value={editProductUnit} onValueChange={(value: Product['unit']) => setEditProductUnit(value)}>
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
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
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-left sm:text-right">Price ({getSymbol()})</Label>
                <Input id="edit-price" type="number" className="col-span-1 sm:col-span-3" value={editProductPrice} onChange={e => setEditProductPrice(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-purchaseDate" className="text-left sm:text-right">Purchase Date</Label>
                <Input id="edit-purchaseDate" type="date" className="col-span-1 sm:col-span-3" value={editProductPurchaseDate} onChange={e => setEditProductPurchaseDate(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label className="text-left sm:text-right">Consumption</Label>
                 <div className="col-span-1 sm:col-span-3 grid grid-cols-2 gap-2">
                    <Select value={editProductConsumptionPeriod} onValueChange={(v) => setEditProductConsumptionPeriod(v as Product['consumptionPeriod'])}>
                        <SelectTrigger>
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="half-monthly">Half-monthly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Input id="edit-consumptionRate" type="number" placeholder="Amount" className="pr-12" value={editProductConsumptionRate} onChange={e => setEditProductConsumptionRate(e.target.value)} />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">{editProductUnit}</span>
                    </div>
                </div>
              </div>
               <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-lowStockThreshold" className="text-left sm:text-right">Low Stock Alert</Label>
                    <div className="col-span-1 sm:col-span-3 relative">
                         <Input id="edit-lowStockThreshold" type="number" placeholder="e.g., 5" className="pr-12" value={editProductLowStockThreshold} onChange={e => setEditProductLowStockThreshold(e.target.value)} />
                         <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">{editProductUnit}</span>
                    </div>
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

    