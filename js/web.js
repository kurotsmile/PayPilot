


      $(document).ready(function() {
        // Load cart items from localStorage on page load
        updateCartUI();
  
        // Add product to cart
        $('.cart-btn').on('click', function() {
          const id = $(this).data('id');
          const name = $(this).data('name');
          const price = $(this).data('price');
  
          addToCart(id, name, price);
          updateCartUI();
        });
  
        // Remove product from cart
        $(document).on('click', '.remove-btn', function() {
          const id = $(this).data('id');
          removeFromCart(id);
          updateCartUI();
        });
  
        // Proceed to checkout
        $('#checkout-btn').on('click', function() {
          window.location.href = 'checkout.html'; // Redirect to checkout page
        });

              // Function to add product to cart
      function addToCart(id, name, price) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === id);
        
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.push({ id, name, price, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
      }

      // Function to remove product from cart
      function removeFromCart(id) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
      }

      // Function to update cart UI
      function updateCartUI() {
        $('#cart-items').empty();
        let total = 0;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let itemCount = 0;

        cart.forEach(item => {
          $('#cart-items').append(`
            <li class="list-group-item d-flex justify-content-between align-items-center">
              ${item.name} - $${item.price} x ${item.quantity}
              <span class="badge bg-dark rounded-pill">$${(item.price * item.quantity).toFixed(2)}</span>
              <button class="btn btn-outline-dark remove-btn btn-sm" data-id="${item.id}"><i class="bi bi-trash-fill"></i> Remove</button>
            </li>
          `);
          total += item.price * item.quantity;
          itemCount += item.quantity;
        });
        $('#cart-total').html(`<h4>Total: $<span id="tt_price">${total.toFixed(2)}</span></h4>`);
        $("#count_cart").html(itemCount);
      }
      });