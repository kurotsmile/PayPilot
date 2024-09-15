
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
      w.show_home();
    });
  }

  show_home(){
      $("#page_title").html(this.setting.title);
      $("#page_subtitle").html(this.setting.subtitle);
  }

  show_about(){
    $("#page_title").html("About Us");
    cr.get("page/about.html",data=>{
      $("#page_containt").html(data);
    });
  }

  show_all_product(){
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

  show_product_by_data(data){
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