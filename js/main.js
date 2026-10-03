/**
 * MAIN.JS - Clothing E-Commerce Interactive Script
 * Handles Quantity selection (+/-), Add to Cart, Wishlist toggles, Search, and Offcanvas Cart
 */

document.addEventListener('DOMContentLoaded', function () {
  let cartItems = [];
  let wishlistCount = 0;

  // Initialize Bootstrap Toasts
  const toastEl = document.getElementById('notificationToast');
  const toast = toastEl ? new bootstrap.Toast(toastEl, { delay: 3000 }) : null;

  function showNotification(title, message, isSuccess = true) {
    if (!toastEl) return;
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const toastIcon = document.getElementById('toastIcon');

    if (toastTitle) toastTitle.textContent = title;
    if (toastBody) toastBody.textContent = message;
    if (toastIcon) {
      toastIcon.className = isSuccess ? 'bi bi-check-circle-fill text-success me-2' : 'bi bi-info-circle-fill text-primary me-2';
    }
    toast.show();
  }

  // 1. Quantity Stepper Controls (+ and - buttons)
  document.addEventListener('click', function (e) {
    const increaseBtn = e.target.closest('.qty-increase');
    const decreaseBtn = e.target.closest('.qty-decrease');

    if (increaseBtn) {
      e.preventDefault();
      const stepper = increaseBtn.closest('.qty-stepper-group');
      const input = stepper.querySelector('.qty-input');
      let val = parseInt(input.value) || 1;
      val += 1;
      input.value = val;
    }

    if (decreaseBtn) {
      e.preventDefault();
      const stepper = decreaseBtn.closest('.qty-stepper-group');
      const input = stepper.querySelector('.qty-input');
      let val = parseInt(input.value) || 1;
      if (val > 1) {
        val -= 1;
        input.value = val;
      }
    }
  });

  // Ensure input does not go below 1 on manual typing
  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('qty-input')) {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) {
        e.target.value = 1;
      }
    }
  });

  // 2. Wishlist Toggle
  document.addEventListener('click', function (e) {
    const wishlistBtn = e.target.closest('.btn-wishlist');
    if (wishlistBtn) {
      e.preventDefault();
      const icon = wishlistBtn.querySelector('i');
      const card = wishlistBtn.closest('.product-card');
      const title = card ? card.querySelector('.product-title')?.textContent.trim() : 'Item';
      const wishlistBadge = document.getElementById('wishlistCountBadge');

      if (wishlistBtn.classList.contains('active')) {
        wishlistBtn.classList.remove('active');
        if (icon) {
          icon.classList.remove('bi-heart-fill');
          icon.classList.add('bi-heart');
        }
        wishlistCount = Math.max(0, wishlistCount - 1);
        showNotification('Wishlist', `Removed "${title}" from wishlist.`, false);
      } else {
        wishlistBtn.classList.add('active');
        if (icon) {
          icon.classList.remove('bi-heart');
          icon.classList.add('bi-heart-fill');
        }
        wishlistCount += 1;
        showNotification('Wishlist', `Added "${title}" to your wishlist!`, true);
      }

      const wishlistBadges = document.querySelectorAll('.wishlist-count-badge, #wishlistCountBadge');
      wishlistBadges.forEach(b => b.textContent = wishlistCount);
    }
  });

  // 3. Add to Cart Handling
  document.addEventListener('click', function (e) {
    const addCartBtn = e.target.closest('.btn-add-cart');
    if (addCartBtn) {
      e.preventDefault();
      const card = addCartBtn.closest('.product-card');
      if (!card) return;

      const title = card.querySelector('.product-title')?.textContent.trim() || 'Clothing Item';
      const priceText = card.querySelector('.product-price-current')?.textContent.trim() || '$0.00';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
      const img = card.querySelector('.product-thumb')?.src || '';
      const qtyInput = card.querySelector('.qty-input');
      const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

      // Add or update cart items
      const existing = cartItems.find(item => item.title === title);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cartItems.push({
          title: title,
          price: price,
          img: img,
          quantity: quantity
        });
      }

      // Reset qty selector back to 1
      if (qtyInput) qtyInput.value = 1;

      updateCartUI();
      showNotification('Cart Updated', `Added ${quantity} x "${title}" to your shopping bag!`, true);
    }
  });

  // Function to Update Cart Modal / Offcanvas and Badge
  function updateCartUI() {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Update navbar badges
    const cartBadges = document.querySelectorAll('.cart-count-badge');
    cartBadges.forEach(b => b.textContent = totalItems);

    // Update Offcanvas Cart content
    const cartContainer = document.getElementById('offcanvasCartItems');
    const emptyState = document.getElementById('cartEmptyState');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotalAmount = document.getElementById('cartTotalAmount');

    if (cartContainer) {
      if (cartItems.length === 0) {
        cartContainer.innerHTML = '';
        if (emptyState) emptyState.classList.remove('d-none');
        if (cartFooter) cartFooter.classList.add('d-none');
      } else {
        if (emptyState) emptyState.classList.add('d-none');
        if (cartFooter) cartFooter.classList.remove('d-none');

        cartContainer.innerHTML = cartItems.map((item, index) => `
          <div class="cart-item-row">
            <img src="${item.img}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-details">
              <div class="cart-item-title">${item.title}</div>
              <div class="cart-item-price">$${item.price.toFixed(2)} &times; ${item.quantity}</div>
            </div>
            <button class="cart-remove-btn" data-index="${index}" title="Remove item">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        `).join('');
      }
    }

    if (cartTotalAmount) {
      cartTotalAmount.textContent = `$${totalPrice.toFixed(2)}`;
    }
  }

  // Remove from Cart listener
  document.addEventListener('click', function (e) {
    const removeBtn = e.target.closest('.cart-remove-btn');
    if (removeBtn) {
      const idx = parseInt(removeBtn.getAttribute('data-index'));
      if (!isNaN(idx) && cartItems[idx]) {
        const removed = cartItems.splice(idx, 1)[0];
        updateCartUI();
        showNotification('Item Removed', `Removed "${removed.title}" from your cart.`, false);
      }
    }
  });

  // 4. Search Form Handler
  const searchForms = document.querySelectorAll('.search-form');
  searchForms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="search"]');
      const query = input ? input.value.trim().toLowerCase() : '';
      if (!query) {
        showNotification('Search', 'Please enter a keyword to search clothing.', false);
        return;
      }

      const products = document.querySelectorAll('.product-card');
      let matches = 0;
      if (products.length > 0) {
        products.forEach(p => {
          const title = p.querySelector('.product-title')?.textContent.toLowerCase() || '';
          const category = p.querySelector('.product-category-tag')?.textContent.toLowerCase() || '';
          if (title.includes(query) || category.includes(query)) {
            p.closest('.col-product')?.classList.remove('d-none');
            matches++;
          } else {
            p.closest('.col-product')?.classList.add('d-none');
          }
        });

        // Scroll to products section
        const targetSection = document.getElementById('products-section') || document.querySelector('.products-container');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }

        showNotification('Search Results', `Found ${matches} item(s) matching "${query}".`, matches > 0);
      } else {
        // If on about or contact page, redirect to index with query or notify
        window.location.href = `index.html?search=${encodeURIComponent(query)}#products-section`;
      }
    });
  });

  // Check URL parameters for search when loading index.html
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    const navInput = document.querySelector('.nav-search-input');
    if (navInput) navInput.value = searchParam;
    setTimeout(() => {
      const form = document.querySelector('.search-form');
      if (form) form.dispatchEvent(new Event('submit'));
    }, 300);
  }

  // 5. Category Tab Filtering on Homepage (All, Men, Women, Kids)
  const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');
  categoryFilterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      categoryFilterBtns.forEach(b => b.classList.remove('active', 'btn-dark'));
      categoryFilterBtns.forEach(b => b.classList.add('btn-outline-dark'));
      
      this.classList.remove('btn-outline-dark');
      this.classList.add('active', 'btn-dark');

      const filter = this.getAttribute('data-filter');
      const productCols = document.querySelectorAll('.col-product');

      productCols.forEach(col => {
        const itemCategory = col.getAttribute('data-category');
        if (filter === 'all' || itemCategory === filter) {
          col.classList.remove('d-none');
        } else {
          col.classList.add('d-none');
        }
      });
    });
  });

  // 6. Mobile Floating Back to Top Button
  const backToTopBtn = document.getElementById('btnBackToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 280) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 7. Auto-close mobile navbar collapse when clicking links
  const navCollapseEl = document.getElementById('navContent');
  if (navCollapseEl) {
    const navLinks = navCollapseEl.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapseEl);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }
});
