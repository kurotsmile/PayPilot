
cr_firestore.id_project = "xoilacfoodball";
cr_firestore.api_key = "AIzaSyD2cbGXjqxKHzmtARX6ejsCDJePDpth39Y";

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

class Web{
  setting=null;
  onLoad(){
    cr_firestore.get("setting","setting_home_shop",data=>{
      w.setting=data;
      $('head').append('<script src="https://www.paypal.com/sdk/js?client-id='+w.setting.api_paypal+'&intent=authorize"><\/script>');

      var page=cr.arg("p");
      if(page=="home") w.show_home();
      else if(page=="product") w.show_product();
      else if(page=="cart") w.show_cart();
      else if(page=="checkout") w.show_checkout();
      else if(page=="done") w.show_pay_done();
      else if(page=="about") w.show_about();
      else w.show_home();
    });
  }

  show_home(){
      $("#page_title").html(this.setting.title);
      $("#page_subtitle").html(this.setting.subtitle);
  }

  show_about(){
    cr.change_title("About Us","index.html?p=about");
    $("#page_title").html("About Us");
    cr.get("page/about.html",data=>{
      $("#page_containt").html(data);
    });
  }

  show_pay_done(){
    $("#page_title").html("Payment");
    cr.get("page/pay_done.html",data=>{
      $("#page_containt").html(data);
      w.get_token(cr.arg('authorization_id'));
    });
  }

  show_cart(){
    cr.change_title("Cart","index.html?p=cart");
    cr.top();
    $("#page_title").html('<i class="fas fa-shopping-cart"></i> Cart');
    var html_cart='';
    html_cart+='<ul id="cart-items" class="list-group"></ul>';
    html_cart+='<div id="cart-total" class="d-flex justify-content-between align-items-center mt-3">';
    html_cart+='<h4>Total: $0.00</h4>';
    html_cart+='</div>';
    html_cart+='<button id="checkout-btn" onclick="w.show_checkout();return false;" class="btn btn-outline-dark mt-3"><i class="bi bi-cart-check"></i> Proceed to Checkout</button>';
    $("#page_containt").html(html_cart);
    updateCartUI();
  }

  show_checkout(){
    cr.change_title("Checkout","index.html?p=checkout");
    cr.top();
    $("#page_title").html('<i class="fas fa-cart-arrow-down"></i> Checkout');
    cr.get("page/checkout.html",data=>{
      $("#page_containt").html(data);
        // Tạo PayPal Button
        paypal.Buttons({
          createOrder: function (data, actions) {
            // Lấy giá trị sản phẩm, phí vận chuyển và thuế từ DOM hoặc tính toán chúng
            var itemTotal = parseFloat($('#tt_price').html()); // Giá trị của sản phẩm
            var shippingCost = 0.50;
            var taxAmount = 0.60;

            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: "USD",
                  value: (itemTotal + shippingCost + taxAmount).toFixed(2), // Tổng giá trị đơn hàng bao gồm phí vận chuyển và thuế
                  breakdown: {
                    item_total: {
                      currency_code: "USD",
                      value: itemTotal.toFixed(2) // Giá trị của sản phẩm
                    },
                    shipping: {
                      currency_code: "USD",
                      value: shippingCost.toFixed(2) // Phí vận chuyển
                    },
                    tax_total: {
                      currency_code: "USD",
                      value: taxAmount.toFixed(2) // Thuế
                    }
                  }
                }
              }]
            });
          },
          onApprove: function (data, actions) {
            return actions.order.authorize().then(function (authorization) {
              var authorizationID = authorization.purchase_units[0].payments.authorizations[0].id;
              console.log('Authorization ID:', authorizationID);
              window.location.href = "index.html?p=done&authorization_id=" + authorizationID;
            });
          },
          onCancel: function (data) {
            Swal.fire({
              icon: 'info',
              title: 'Payment Cancelled',
              text: 'You have cancelled the payment.',
            });
          },
          onError: function (err) {
            console.log(err);

            Swal.fire({
              icon: 'error',
              title: 'Payment Error',
              text: 'There was an issue with your payment. Please try again.',
            });
          }
        }).render('#paypal-button-container');
        updateCartUI();
    });
  }

  show_all_product(){
    cr.change_title("All Product","index.html?p=all_products");
    cr.top();
    $("#page_title").html("All Products");
    $("#page_subtitle").html(this.setting.subtitle);
    var html_p='';
    $("#page_containt").html("Loading...");
    cr_firestore.list("product", (datas) => {
      $("#page_containt").html('<div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center" id="all_product_home"></div>');
      $.each(datas, function (index, p) {
        p.index = index;
        var img = '';
        if (p.image.trim() == "") img = 'https://dummyimage.com/450x300/dee2e6/6c757d.jpg';
        else img = p.image;
        var p_html = `
                    <div class="col mb-5">
                        <div class="card custom-card h-100">
                            ${p.sale == "" ? '' : '<div class="badge bg-dark text-white position-absolute" style="top: 0.5rem; right: 0.5rem">Sale</div>'}    
                            <!-- Product image-->    
                            <img class="card-img-top" src="${img}" alt="..." />    
                            <!-- Product details-->    
                            <div class="card-body p-4">        
                                <div class="text-center">            
                                    <!-- Product name-->            
                                    <b class="fw-bolder w-100" style="font-size:13px">${p.name}</b><br/>
                                    ${p_star(p.star)}
                                    <!-- Product price-->           
                                    <span class="text-muted text-decoration-line-through">${p.sale}</span> ${p.price}<b>$</b>    
                                </div>
                            </div>    
                            <!-- Product actions-->    
                            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">        
                                <div class="text-center">
                                <a data-id="${index}" data-name="${p.name}" data-price="${p.price}" class="btn btn-outline-dark mt-auto cart-btn" href="#">
                                    <i class="bi bi-cart-plus"></i> Add to cart
                                </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
        var emp_p = $(p_html);

        $(emp_p).find("img").click(() => {
          w.show_product_by_data(p);
        });

        $(emp_p).find('.cart-btn').on('click', function () {
          const id = $(this).data('id'); const name = $(this).data('name'); const price = $(this).data('price');
          addToCart(id, name, price); updateCartUI();
        });
        $("#all_product_home").append(emp_p);
      });
    });
  }

  show_product(){
    var id_product=cr.arg("id");
    cr_firestore.get("product",id_product,(data)=>{
       w.show_product_by_data(data);
    },()=>{
      w.show_product();
    });
  }

  show_product_by_data(data){
    cr.change_title(data.name,"?p=product&id="+data.id_doc)
    var img = '';
    if (data.image.trim() == "") img = 'https://dummyimage.com/450x300/dee2e6/6c757d.jpg';
    else img = data.image;
    cr.top();
    var html_p='<div class="container px-4 px-lg-5 mt-5">';
    html_p+='<div class="row">';
      html_p+='<div class="col-md-4 col-12 col-lg-4"><img class="w-100" src="'+img+'"/></div>';
      html_p+='<div class="col-md-8 col-12 col-lg-8">'
        html_p+='<b style="font-size:30px;">'+data.price+'$</b><br/>';
        html_p+='<a onclick="w.add_cart(this);return false;" data-id="'+data.index+'" data-name="'+data.name+'" data-price="'+data.price+'" class="btn btn-outline-dark mt-auto cart-btn" href="#"><i class="bi bi-cart-plus"></i> Add to cart</a><br/><br/>';
        html_p+=data.tip;
      html_p+='</div>';
    html_p+='</div>';
    html_p+='</div>'
    $("#page_title").html(data.name);
    $("#page_containt").html(html_p);
  }

  add_cart(emp){
    const id = $(emp).data('id'); 
    const name = $(emp).data('name');
    const price = $(emp).data('price');
    addToCart(id, name, price); 
    updateCartUI();
    cr.msg("Product added to cart successfully!","Cart","success");
  }

  get_token(authorizationID){
      $.ajax({
          url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
          method: "POST",
          headers: {
              "Authorization": "Basic " + btoa("AaEa6rk64Piu7oaOnDewMfrYJOV8VqbaDL_RMkkyhWBygCs0sOegbcvQdE4-xAyeaUgysmKqC1eoTx0y:EBCxwMeMboj4I8W2k8gsWjhCUPv6yfLrvZZ0dLh7y5eytg7lYDCruIfLhXCK5F5Gxp0_4YHmktYKKyoU"),
              "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
              "grant_type": "client_credentials"
          },
          success: function(response) {
              var accessToken = response.access_token;
              w.capturePayment(accessToken,authorizationID);
          },
          error: function(error) {
              console.log("Error fetching Access Token", error);
          }
      });
  }

  capturePayment(accessToken, authorizationID) {
      $.ajax({
          url: "https://api-m.sandbox.paypal.com/v2/payments/authorizations/" + authorizationID + "/capture",
          method: "POST",
          headers: {
              "Authorization": "Bearer " + accessToken,
              "Content-Type": "application/json"
          },
          success: function(response) {
              console.log("Payment captured successfully:", response);
              $("#out_log").html(response);
          },
          error: function(error) {
              console.log("Error capturing payment", error);
          }
      });
  }
}
var w=new Web();

$(document).ready(function () {
  updateCartUI();

  // Add product to cart
  $('.cart-btn').on('click', function () {
    const id = $(this).data('id');
    const name = $(this).data('name');
    const price = $(this).data('price');

    addToCart(id, name, price);
    updateCartUI();
  });

  // Remove product from cart
  $(document).on('click', '.remove-btn', function () {
    const id = $(this).data('id');
    removeFromCart(id);
    updateCartUI();
  });

  // Proceed to checkout
  $('#checkout-btn').on('click', function () {
    window.location.href = 'checkout.html?v=1'; // Redirect to checkout page
  });
  
  cr.site_name="My Shop";
  cr.site_url="https://payshop.vercel.app/";
  cr.onLoad();
  cr.add_btn_top();

  w.onLoad();
});