import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: any[] = [];

  addToCart(product: any) {
    const existing = this.items.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ product: product, quantity: 1 });
    }
  }

  decreaseQuantity(product: any) {
    const existing = this.items.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity--;

      if (existing.quantity <= 0) {
        this.items = this.items.filter(item => item.product.id !== product.id);
      }
    }
  }

  removeCompletely(product: any) {
    this.items = this.items.filter(item => item.product.id !== product.id);
  }

  clearCart() {
    this.items = [];
  }

  getItems() {
    return this.items;
  }

  getCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getQuantity(product: any) {
    const item = this.items.find(i => i.product.id === product.id);
    return item ? item.quantity : 0;
  }

  getTotalPrice() {
    return this.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }
}