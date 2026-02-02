import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import * as productsApi from '@/api/products';

const PRODUCT_CATEGORIES = [
  'veterinary_drugs',
  'vaccines',
  'feed',
  'supplements',
  'equipment',
  'breeding',
  'services',
  'other'
];

const UNIT_TYPES = ['kg', 'litre', 'piece', 'dose', 'package'];

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { isActive: categoryFilter === 'all' ? undefined : categoryFilter === 'active' };
      const response = await productsApi.getProducts(params);
      setProducts(response.data.products || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      category: formData.get('category') || 'other',
      unit: formData.get('unit') || 'piece',
      pricing: {
        unitPrice: parseFloat(formData.get('unitPrice')),
        currency: formData.get('currency') || 'UGX',
        discountPrice: formData.get('discountPrice') ? parseFloat(formData.get('discountPrice')) : undefined
      },
      stockQuantity: parseInt(formData.get('stockQuantity') || '0'),
      reorderLevel: parseInt(formData.get('reorderLevel') || '0'),
      tags: formData.get('tags')?.split(',').map(t => t.trim()).filter(Boolean) || [],
      shipping: {
        methods: formData.getAll('shippingMethods'),
        deliveryRadiusKm: formData.get('deliveryRadiusKm') ? parseFloat(formData.get('deliveryRadiusKm')) : undefined,
        fee: formData.get('shippingFee') ? parseFloat(formData.get('shippingFee')) : undefined
      },
      allowPartial: formData.get('allowPartial') === 'true',
      isActive: formData.get('isActive') === 'true'
    };

    try {
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct._id, data);
        toast({
          title: 'Success',
          description: 'Product updated successfully'
        });
      } else {
        await productsApi.createProduct(data);
        toast({
          title: 'Success',
          description: 'Product created successfully'
        });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      e.target.reset();
      loadProducts();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save product',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await productsApi.toggleProductStatus(productId);
      toast({
        title: 'Success',
        description: 'Product status updated'
      });
      loadProducts();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(product =>
    categoryFilter === 'all' || (categoryFilter === 'active' ? product.isActive : !product.isActive)
  );

  const totalValue = products.reduce((sum, p) => sum + (p.pricing?.unitPrice || 0) * (p.stockQuantity || 0), 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0).length;
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">Manage Products</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Add, edit, and manage your marketplace products. Track inventory and sales.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inventory Value</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(totalValue)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your marketplace inventory</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingProduct(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingProduct?.name}
                            placeholder="e.g., Premium Cattle Feed"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select name="category" defaultValue={editingProduct?.category || 'other'}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                  <span className="capitalize">{cat.replace('_', ' ')}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingProduct?.description}
                          placeholder="Product description..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="unitPrice">Unit Price (UGX) *</Label>
                          <Input
                            id="unitPrice"
                            name="unitPrice"
                            type="number"
                            step="0.01"
                            defaultValue={editingProduct?.pricing?.unitPrice}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="discountPrice">Discount Price (Optional)</Label>
                          <Input
                            id="discountPrice"
                            name="discountPrice"
                            type="number"
                            step="0.01"
                            defaultValue={editingProduct?.pricing?.discountPrice}
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">Unit *</Label>
                          <Select name="unit" defaultValue={editingProduct?.unit || 'piece'}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_TYPES.map(unit => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="stockQuantity">Stock Quantity</Label>
                          <Input
                            id="stockQuantity"
                            name="stockQuantity"
                            type="number"
                            defaultValue={editingProduct?.stockQuantity || 0}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reorderLevel">Reorder Level</Label>
                          <Input
                            id="reorderLevel"
                            name="reorderLevel"
                            type="number"
                            defaultValue={editingProduct?.reorderLevel || 0}
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Shipping Methods</Label>
                        <div className="space-y-2">
                          {['pickup', 'courier', 'farmer_arranged'].map(method => (
                            <label key={method} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="shippingMethods"
                                value={method}
                                defaultChecked={editingProduct?.shipping?.methods?.includes(method) || method === 'pickup'}
                                className="rounded"
                              />
                              <span className="capitalize">{method.replace('_', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deliveryRadiusKm">Delivery Radius (km)</Label>
                          <Input
                            id="deliveryRadiusKm"
                            name="deliveryRadiusKm"
                            type="number"
                            defaultValue={editingProduct?.shipping?.deliveryRadiusKm}
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingFee">Shipping Fee (UGX)</Label>
                          <Input
                            id="shippingFee"
                            name="shippingFee"
                            type="number"
                            defaultValue={editingProduct?.shipping?.fee}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          name="tags"
                          defaultValue={editingProduct?.tags?.join(', ')}
                          placeholder="e.g., premium, organic, bulk"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="allowPartial"
                            value="true"
                            defaultChecked={editingProduct?.allowPartial}
                            className="rounded"
                          />
                          <span>Allow partial orders</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="isActive"
                            value="true"
                            defaultChecked={editingProduct?.isActive !== false}
                            className="rounded"
                          />
                          <span>Active (visible in marketplace)</span>
                        </label>
                      </div>

                      <Button type="submit" className="w-full">
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No products found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <Card key={product._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <CardDescription className="capitalize">
                              {product.category.replace('_', ' ')}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(product._id)}
                            >
                              {product.isActive ? (
                                <EyeOff className="h-4 w-4 text-orange-600" />
                              ) : (
                                <Eye className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Price:</span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(product.pricing?.unitPrice || 0)}
                              {' '}/ {product.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Stock:</span>
                            <Badge
                              variant={
                                product.stockQuantity === 0
                                  ? 'destructive'
                                  : product.stockQuantity <= product.reorderLevel
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {product.stockQuantity} {product.unit}
                            </Badge>
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                          )}
                          {product.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default VendorProducts;

