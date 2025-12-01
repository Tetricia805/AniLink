import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Truck,
  CreditCard,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import * as ordersApi from '@/api/orders';

const SHIPPING_METHODS = ['pickup', 'courier', 'farmer_arranged'];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal, groupCartByVendor } = useCart();
  const [shippingMethods, setShippingMethods] = useState({});
  const [shippingAddresses, setShippingAddresses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const groupedCart = groupCartByVendor();

  const handlePlaceOrder = async (vendorId, items) => {
    if (!shippingMethods[vendorId]) {
      toast({
        title: 'Error',
        description: 'Please select a shipping method',
        variant: 'destructive'
      });
      return;
    }

    if (shippingMethods[vendorId] === 'courier' && !shippingAddresses[vendorId]?.addressLine) {
      toast({
        title: 'Error',
        description: 'Please provide shipping address for courier delivery',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        vendorId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shipping: {
          method: shippingMethods[vendorId],
          address: shippingMethods[vendorId] === 'courier' ? shippingAddresses[vendorId] : undefined
        }
      };

      await ordersApi.createOrder(orderData);
      toast({
        title: 'Order Placed!',
        description: 'Your order has been placed successfully. You will receive a confirmation shortly.'
      });

      // Remove ordered items from cart
      items.forEach(item => removeFromCart(item.productId));
      
      // Clear shipping data for this vendor
      const newShippingMethods = { ...shippingMethods };
      const newShippingAddresses = { ...shippingAddresses };
      delete newShippingMethods[vendorId];
      delete newShippingAddresses[vendorId];
      setShippingMethods(newShippingMethods);
      setShippingAddresses(newShippingAddresses);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to place order',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some products to get started!</p>
            <Button onClick={() => navigate('/marketplace')}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Checkout</h1>
          <p className="text-lg opacity-90 mt-2">Review your order and complete your purchase</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items by Vendor */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedCart).map(([vendorId, items]) => {
                const vendor = items[0]?.product?.vendor;
                const vendorTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
                const shippingFee = shippingMethods[vendorId] === 'courier' ? 10000 : 0;
                const orderTotal = vendorTotal + shippingFee;

                return (
                  <Card key={vendorId}>
                    <CardHeader>
                      <CardTitle>Order from {vendor?.name || 'Vendor'}</CardTitle>
                      <CardDescription>{items.length} item(s)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Cart Items */}
                      <div className="space-y-4">
                        {items.map(item => (
                          <div key={item.productId} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.unitPrice)} / {item.unit}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Method */}
                      <div>
                        <Label>Shipping Method *</Label>
                        <Select
                          value={shippingMethods[vendorId] || ''}
                          onValueChange={(value) =>
                            setShippingMethods({ ...shippingMethods, [vendorId]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shipping method" />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIPPING_METHODS.map(method => (
                              <SelectItem key={method} value={method}>
                                <span className="capitalize">{method.replace('_', ' ')}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Shipping Address (if courier) */}
                      {shippingMethods[vendorId] === 'courier' && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <Label className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Shipping Address</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`contactName-${vendorId}`} className="text-xs">Contact Name</Label>
                              <Input
                                id={`contactName-${vendorId}`}
                                value={shippingAddresses[vendorId]?.contactName || ''}
                                onChange={(e) =>
                                  setShippingAddresses({
                                    ...shippingAddresses,
                                    [vendorId]: {
                                      ...shippingAddresses[vendorId],
                                      contactName: e.target.value
                                    }
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`phone-${vendorId}`} className="text-xs">Phone</Label>
                              <Input
                                id={`phone-${vendorId}`}
                                value={shippingAddresses[vendorId]?.phone || ''}
                                onChange={(e) =>
                                  setShippingAddresses({
                                    ...shippingAddresses,
                                    [vendorId]: {
                                      ...shippingAddresses[vendorId],
                                      phone: e.target.value
                                    }
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`addressLine-${vendorId}`} className="text-xs">Address Line</Label>
                            <Textarea
                              id={`addressLine-${vendorId}`}
                              value={shippingAddresses[vendorId]?.addressLine || ''}
                              onChange={(e) =>
                                setShippingAddresses({
                                  ...shippingAddresses,
                                  [vendorId]: {
                                    ...shippingAddresses[vendorId],
                                    addressLine: e.target.value
                                  }
                                })
                              }
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`district-${vendorId}`} className="text-xs">District</Label>
                              <Input
                                id={`district-${vendorId}`}
                                value={shippingAddresses[vendorId]?.district || ''}
                                onChange={(e) =>
                                  setShippingAddresses({
                                    ...shippingAddresses,
                                    [vendorId]: {
                                      ...shippingAddresses[vendorId],
                                      district: e.target.value
                                    }
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`region-${vendorId}`} className="text-xs">Region</Label>
                              <Input
                                id={`region-${vendorId}`}
                                value={shippingAddresses[vendorId]?.region || ''}
                                onChange={(e) =>
                                  setShippingAddresses({
                                    ...shippingAddresses,
                                    [vendorId]: {
                                      ...shippingAddresses[vendorId],
                                      region: e.target.value
                                    }
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatPrice(vendorTotal)}</span>
                        </div>
                        {shippingFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span>{formatPrice(shippingFee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatPrice(orderTotal)}</span>
                        </div>
                      </div>

                      {/* Place Order Button */}
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handlePlaceOrder(vendorId, items)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Place Order
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items ({cart.length}):</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Payment Information</p>
                        <p>Payment will be processed after order confirmation. You'll receive payment instructions via SMS.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;

