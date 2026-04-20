import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private items: any[] = [];

  addToWishlist(product: any) {
    const exists = this.items.find(item => item.id === product.id);
    if (!exists) {
      this.items.push(product);
    }
  }

  removeFromWishlist(product: any) {
    this.items = this.items.filter(item => item.id !== product.id);
  }

  getItems() {
    return this.items;
  }

  isInWishlist(product: any) {
    return this.items.some(item => item.id === product.id);
  }
}