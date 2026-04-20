import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './services/product';
import { CartService } from './services/cart';
import { OrderService } from './services/order';
import { AuthService } from './services/auth';
import { WishlistService } from './services/wishlist';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {


  // Login / Signup popup state
  showLogin: boolean = false;
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  currentUser: any = null;

  // Auth form fields
  loginName: string = '';
  loginEmail: string = '';
  loginPassword: string = '';
  loginAddress: string = '';

  // OTP state
  showOtpBox: boolean = false;
  signupOtp: string = '';

  // Toast state
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  // Product / cart data
  products: any[] = [];
  filteredProducts: any[] = [];
  suggestions: any[] = [];
  cartItems: any[] = [];

  topDeals: any[] = [];
  trending: any[] = [];
  recommended: any[] = [];

  //product detail page
  selectedProduct: any = null;
  showProductDetail: boolean = false;
  

  // UI state
  searchText: string = '';
  showSuggestions: boolean = false;
  showCart: boolean = false;
  showCheckout: boolean = false;
  showPayment: boolean = false;
  showProcessing: boolean = false;
  showSuccess: boolean = false;
  showProfile: boolean = false;
  showOrders: boolean = false;
  // For category filter
  categories: string[] = [];

  //gallery 
  currentImageIndex = 0;
  productImages: string[] = [];
  currentProductImage: string = '';

  // Wishlist
  showWishlist: boolean = false;
  wishlistItems: any[] = [];

  // Payment
  selectedPaymentMethod: string = '';

  // Cart summary
  cartCount: number = 0;
  totalPrice: number = 0;

  // Checkout
  checkoutItems: any[] = [];
  checkoutTotal: number = 0;

  customerName: string = '';
  customerEmail: string = '';
  customerAddress: string = '';

  // Orders
  orderHistory: any[] = [];

  // Banner slider
  bannerImages: string[] = [
    'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
  ];
  currentBannerIndex: number = 0;

  // ADMIN
    isAdmin: boolean = false;

    showAddProduct: boolean = false;

    // product form for admin to add new product
    newProduct = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    brand: ''
};

  private productService = inject(ProductService);
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  wishlistService = inject(WishlistService);

ngOnInit(): void {
  // Restore login from localStorage
  const savedLogin = localStorage.getItem('isLoggedIn');
  const savedUser = localStorage.getItem('currentUser');
  const savedAdmin = localStorage.getItem('isAdmin');

  this.isAdmin = savedAdmin === 'true';

  if (savedLogin === 'true' && savedUser) {
    this.isLoggedIn = true;
    this.currentUser = JSON.parse(savedUser);

    this.customerName = this.currentUser.name;
    this.customerEmail = this.currentUser.email;
    this.customerAddress = this.currentUser.address;
  }

  this.updateCartState();

  this.productService.getProducts().subscribe({
    next: (data: any[]) => {
      this.products = data;
      this.filteredProducts = data;

      this.topDeals = data.slice(0, 5);
      this.trending = data.slice(5, 10);
      this.recommended = data.slice(10, 15);

      const catSet = new Set<string>();

    data.forEach((p: any) => {
    if (p.category) {
    catSet.add(p.category.trim().toLowerCase());
    }
    });

    this.categories = ['All', ...Array.from(catSet)];
    },
    error: (err: any) => {
      console.error('API error:', err);
      this.showToastMessage('Failed to load products', 'error');
    }
    });

  setInterval(() => {
    this.nextBanner();
    if (this.showProductDetail) {
    this.nextImage();
  }
  }, 3000);
}

  viewFromSection(product: any) {
  // show selected product in main grid
  this.filteredProducts = [product];

  // scroll to product section
  setTimeout(() => {
    const el = document.getElementById('product-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}

  nextBanner() {
    this.currentBannerIndex =
      (this.currentBannerIndex + 1) % this.bannerImages.length;
  }

  prevBanner() {
    this.currentBannerIndex =
      (this.currentBannerIndex - 1 + this.bannerImages.length) % this.bannerImages.length;
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  // Admin function to add new product
addProduct() {
  this.productService.addProduct(this.newProduct).subscribe({
    next: (res: any) => {
      this.products.push(res);
      this.filteredProducts = this.products;

      this.showToastMessage('Product added 🎉', 'success');

      // reset form
      this.newProduct = {
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: '',
        brand: ''
      };

      this.showAddProduct = false;
    },
    error: () => {
      this.showToastMessage('Failed to add product ❌', 'error');
    }
  });
}

  openProfileOrLogin() {
  if (this.isLoggedIn) {
    this.openProfile();
  } else {
    this.openLogin();
  }
}

openProfile() {
  if (!this.isLoggedIn) {
    this.openLogin();
    return;
  }

  this.showProfile = true;
  this.showCart = false;
  this.showCheckout = false;
  this.showPayment = false;
  this.showOrders = false;
  this.showWishlist = false;
}

closeProfile() {
  this.showProfile = false;
}

  openLogin() {
    this.authMode = 'login';
    this.showLogin = true;
    this.showOtpBox = false;
    this.signupOtp = '';
    this.clearAuthFields();
  }

  openSignup() {
    this.authMode = 'signup';
    this.showLogin = true;
    this.showOtpBox = false;
    this.signupOtp = '';
    this.clearAuthFields();
  }

  closeLogin() {
    this.showLogin = false;
    this.showOtpBox = false;
    this.signupOtp = '';
    this.clearAuthFields();
  }

  switchToLogin() {
    this.authMode = 'login';
    this.showOtpBox = false;
    this.signupOtp = '';
    this.clearAuthFields();
  }

  switchToSignup() {
    this.authMode = 'signup';
    this.showOtpBox = false;
    this.signupOtp = '';
    this.clearAuthFields();
  }

  clearAuthFields() {
    this.loginName = '';
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginAddress = '';
  }

  openProduct(product: any) {
  this.selectedProduct = product;
  this.showProductDetail = true;

  this.productImages = [
    product.imageUrl,
    product.imageUrl2,
    product.imageUrl3,
    product.imageUrl4,
    product.imageUrl5
  ].filter((img: any) => img && img !== '');

  console.log('IMAGES:', this.productImages); // debug

  this.currentImageIndex = 0;

  this.currentProductImage = this.productImages.length > 0
    ? this.productImages[0]
    : 'https://via.placeholder.com/300';
}

nextImage() {
  if (this.productImages.length === 0) return;

  this.currentImageIndex =
    (this.currentImageIndex + 1) % this.productImages.length;

  this.currentProductImage =
    this.productImages[this.currentImageIndex];
}

prevImage() {
  if (this.productImages.length === 0) return;

  this.currentImageIndex =
    (this.currentImageIndex - 1 + this.productImages.length) % this.productImages.length;

  this.currentProductImage =
    this.productImages[this.currentImageIndex];
}


closeProduct() {
  this.showProductDetail = false;
}

  login() {
  // Admin login check
  if (this.loginEmail === 'admin@gmail.com' && this.loginPassword === 'admin123') {
    this.isLoggedIn = true;
    this.isAdmin = true;

    this.currentUser = {
      name: 'Admin',
      email: this.loginEmail,
      address: 'Admin Panel'
    };

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

    this.customerName = 'Admin';
    this.customerEmail = this.loginEmail;
    this.customerAddress = 'Admin Panel';

    this.showLogin = false;
    this.showOtpBox = false;
    this.signupOtp = '';
    this.clearAuthFields();

    this.showToastMessage('Admin login successful ✅', 'success');
    return;
  }

  const data = {
    email: this.loginEmail,
    password: this.loginPassword
  };

  this.authService.login(data).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.isLoggedIn = true;
        this.isAdmin = false; // important
        this.currentUser = res.user;

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', 'false');
        localStorage.setItem('currentUser', JSON.stringify(res.user));

        this.customerName = res.user.name;
        this.customerEmail = res.user.email;
        this.customerAddress = res.user.address;

        this.showLogin = false;
        this.showOtpBox = false;
        this.signupOtp = '';
        this.clearAuthFields();

        this.showToastMessage('Login successful ✅', 'success');
      } else {
        this.showToastMessage(res.message, 'error');
      }
    },
    error: (err: any) => {
      console.error(err);
      this.showToastMessage('Login failed', 'error');
    }
  });
}
  signup() {
    const data = {
      name: this.loginName,
      email: this.loginEmail,
      password: this.loginPassword,
      address: this.loginAddress
    };

    this.authService.sendOtp(data).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showOtpBox = true;
          this.showToastMessage('OTP sent to your email', 'success');
        } else {
          this.showToastMessage(res.message, 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.showToastMessage('Failed to send OTP', 'error');
      }
    });
  }

  verifyOtp() {
    const data = {
      email: this.loginEmail,
      otp: this.signupOtp
    };

    this.authService.verifyOtp(data).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showOtpBox = false;
          this.signupOtp = '';
          this.authMode = 'login';
          this.loginName = '';
          this.loginPassword = '';
          this.loginAddress = '';
          this.showToastMessage('Signup verified successfully 🎉 Please login now.', 'success');
        } else {
          this.showToastMessage(res.message, 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.showToastMessage('OTP verification failed', 'error');
      }
    });
  }

  openOrders() {
    if (!this.isLoggedIn || !this.currentUser?.email) {
      this.showToastMessage('Please login to view orders', 'error');
      this.openLogin();
      return;
    }

    this.showProfile = false;
    this.showCart = false;
    this.showCheckout = false;
    this.showPayment = false;
    this.showOrders = true;

    this.orderService.getOrderHistory(this.currentUser.email).subscribe({
      next: (res: any) => {
        this.orderHistory = res;
      },
      error: (err: any) => {
        console.error(err);
        this.showToastMessage('Failed to load order history', 'error');
      }
    });
  }

  closeOrders() {
    this.showOrders = false;
    this.showProfile = true;
  }

  logout() {
  this.isLoggedIn = false;
  this.currentUser = null;

  // ❌ CLEAR STORAGE
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');

  this.customerName = '';
  this.customerEmail = '';
  this.customerAddress = '';

  this.showCart = false;
  this.showCheckout = false;
  this.showLogin = false;
  this.showPayment = false;
  this.showProcessing = false;
  this.showSuccess = false;
  this.showProfile = false;
  this.showOrders = false;
  this.showWishlist = false;
  this.orderHistory = [];

  this.showToastMessage('Logged out 👋', 'info');
}

  openWishlist() {
  if (!this.isLoggedIn) {
    this.openLogin();
    return;
  }

  this.showProfile = false;
  this.showCart = false;
  this.showCheckout = false;
  this.showPayment = false;
  this.showOrders = false;
  this.showWishlist = true;

  this.wishlistItems = this.wishlistService.getItems();
}

closeWishlist() {
  this.showWishlist = false;
  this.showProfile = true;
}

toggleWishlist(product: any) {
  if (!this.isLoggedIn) {
    this.openLogin();
    return;
  }

  if (this.wishlistService.isInWishlist(product)) {
    this.wishlistService.removeFromWishlist(product);
    this.showToastMessage('Removed from wishlist', 'info');
  } else {
    this.wishlistService.addToWishlist(product);
    this.showToastMessage('Added to wishlist ❤️', 'success');
  }

  this.wishlistItems = this.wishlistService.getItems();
}

removeFromWishlist(product: any) {
  this.wishlistService.removeFromWishlist(product);
  this.wishlistItems = this.wishlistService.getItems();
  this.showToastMessage('Removed from wishlist', 'info');
}

  search() {
    const text = this.searchText.trim().toLowerCase();

    if (text === '') {
      this.filteredProducts = this.products;
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(text)
    );

    this.suggestions = this.products
      .filter(product => product.name.toLowerCase().includes(text))
      .slice(0, 5);

    this.showSuggestions = true;
  }

  selectSuggestion(product: any) {
    this.searchText = product.name;
    this.filteredProducts = [product];
    this.suggestions = [];
    this.showSuggestions = false;
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  showSuggestionBox() {
    if (this.searchText.trim().length > 0 && this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
    this.updateCartState();
    this.showToastMessage('Added to cart', 'success');
  }

  increase(product: any) {
    this.cartService.addToCart(product);
    this.updateCartState();
  }

  decrease(product: any) {
    this.cartService.decreaseQuantity(product);
    this.updateCartState();
  }

  removeCompletely(product: any) {
    this.cartService.removeCompletely(product);
    this.updateCartState();
    this.showToastMessage('Item removed from cart', 'info');
  }

  selectedCategory: string = 'All';

filterCategory(category: string) {
  this.selectedCategory = category;

  if (!this.products || this.products.length === 0) {
    return;
  }

  if (category === 'All') {
    this.filteredProducts = [...this.products];
  } else {
    this.filteredProducts = this.products.filter((p: any) =>
      String(p.category || '').trim().toLowerCase().includes(category.trim().toLowerCase())
    );
  }

  setTimeout(() => {
    document.getElementById('product-section')?.scrollIntoView({
      behavior: 'smooth'
    });
  }, 100);
}

  toggleCart() {
  this.showCart = !this.showCart;
  this.showCheckout = false;
  this.showPayment = false;
  this.showProfile = false;
  this.showOrders = false;
  this.showWishlist = false;
  this.updateCartState();
}

  goBackToProducts() {
  this.showCart = false;
  this.showCheckout = false;
  this.showPayment = false;
  this.showProfile = false;
  this.showOrders = false;
  this.showWishlist = false;
}

  buyNow(product: any) {
    this.checkoutItems = [{ product, quantity: 1 }];
    this.checkoutTotal = product.price;
    this.showCart = false;
    this.showCheckout = true;
    this.showPayment = false;
    this.showProfile = false;
    this.showOrders = false;
    this.showWishlist = false;
  }

  buyAllNow() {
    if (this.cartItems.length === 0) {
      this.showToastMessage('Your cart is empty', 'error');
      return;
    }

    this.checkoutItems = [...this.cartItems];
    this.checkoutTotal = this.totalPrice;
    this.showCart = false;
    this.showCheckout = true;
    this.showPayment = false;
    this.showProfile = false;
    this.showOrders = false;
  }

  placeOrder() {
    if (!this.isLoggedIn) {
      this.showLogin = true;
      return;
    }

    if (!this.customerName || !this.customerEmail || !this.customerAddress) {
      this.showToastMessage('Please fill all checkout details', 'error');
      return;
    }

    this.showCheckout = false;
    this.showPayment = true;
  }

  selectPayment(method: string) {
    this.selectedPaymentMethod = method;
  }

  continuePayment() {
    if (!this.selectedPaymentMethod) {
      this.showToastMessage('Please select a payment method', 'error');
      return;
    }

    this.showPayment = false;
    this.showProcessing = true;

    setTimeout(() => {
      this.showProcessing = false;
      this.showSuccess = true;
      this.saveOrderToBackend();
    }, 2500);
  }

  saveOrderToBackend() {
    const orderData = {
      customerName: this.customerName,
      email: this.customerEmail,
      address: this.customerAddress,
      totalPrice: this.checkoutTotal
    };

    this.orderService.placeOrder(orderData).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.updateCartState();

        this.checkoutItems = [];
        this.checkoutTotal = 0;
      },
      error: (err: any) => {
        console.error(err);
        this.showToastMessage('Order failed to save ❌', 'error');
      }
    });
  }

  closeSuccess() {
    this.showSuccess = false;
    this.selectedPaymentMethod = '';
    this.showToastMessage('Order placed successfully 🎉', 'success');
    this.goBackToProducts();
  }

  cancelCheckout() {
    this.showCheckout = false;

    if (this.cartItems.length > 0) {
      this.showCart = true;
    }
  }

  cancelPayment() {
    this.showPayment = false;
    this.showCheckout = true;
  }

  private updateCartState() {
    this.cartItems = this.cartService.getItems();
    this.cartCount = this.cartService.getCount();
    this.totalPrice = this.cartService.getTotalPrice();
  }
}