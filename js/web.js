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
  let tax=parseFloat(w.setting.tax_price);
  let shipping=parseFloat(w.setting.shipping_price);

  if(cart.length>0){
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
  }else{
    $('#cart-items').html('<li><i class="fas fa-sad-tear"></i> No Product!</li>');
  }

  $('#cart-shipping').html(`$${shipping.toFixed(2)}`);
  $('#cart-tax').html(`$${tax.toFixed(2)}`);
  $('#cart-total-sub').html(`<b>Subtotal</b><h5>$<span id="tt_price">${total.toFixed(2)}</span></h5>`);
  $('#cart-total').html(`<b>Total</b><h4>$<span >${(total+tax+shipping).toFixed(2)}</span></h4>`);
  $("#count_cart").html(itemCount);
}

class Web{

  api_paypal="";
  api_paypal_scenrest="";

  index_app_paypay_cur=0;
  paypal_app=[];

  setting=null;
  setting_footer=null;
  setting_footer_info=null;
  setting_pay=null;
  setting_fb_pixel=null;
  data_bill=null;
  ver='1.0';

  onLoad(){
    w.data_bill=JSON.parse(localStorage.getItem('data_bill')) || [];
    cr.get_json("config.json",(config_data)=>{
        cr.site_url=config_data.site_url;
        cr_firestore.id_project = config_data.id_project;
        cr_firestore.api_key = config_data.api_key;
        cr_firestore.list("setting",datas=>{
          $.each(datas,function(index,setting){
            if(setting.id_doc=="setting_home_shop") w.setting=setting;
            if(setting.id_doc=="setting_footer_shop") w.setting_footer=setting;
            if(setting.id_doc=="setting_footer_info") w.setting_footer_info=setting;
            if(setting.id_doc=="setting_pay") w.setting_pay=setting;
            if(setting.id_doc=="setting_fb_pixel") w.setting_fb_pixel=setting;
            if(setting.id_doc=="setting_pp_1") w.paypal_app.push({"api_paypal":setting.api_paypal,"api_paypal_scenrest":setting.api_paypal_scenrest});
            if(setting.id_doc=="setting_pp_2") w.paypal_app.push({"api_paypal":setting.api_paypal,"api_paypal_scenrest":setting.api_paypal_scenrest});
            if(setting.id_doc=="setting_pp_3") w.paypal_app.push({"api_paypal":setting.api_paypal,"api_paypal_scenrest":setting.api_paypal_scenrest});
          });

          w.index_app_paypay_cur=parseInt(w.setting_pay.acc_paypal_sel);
          w.api_paypal=w.paypal_app[w.index_app_paypay_cur].api_paypal;
          w.api_paypal_scenrest=w.paypal_app[w.index_app_paypay_cur].api_paypal_scenrest;
  
          $('head').append('<script src="https://www.paypal.com/sdk/js?client-id='+w.api_paypal+'&intent=authorize"><\/script>');
          $('#logo_txt').html(w.setting.logo_txt);
          cr.site_name=w.setting.logo_txt;
  
          var page=cr.arg("p");
          if(page=="home") w.show_home();
          else if(page=="product") w.show_product();
          else if(page=="privacy_policy") w.show_pp();
          else if(page=='terms_of_service') w.show_tos();
          else if(page=="cart") w.show_cart();
          else if(page=="checkout") w.show_checkout();
          else if(page=="done") w.show_pay_done();
          else if(page=="about") w.show_about();
          else w.show_home();
  
          $.each(w.setting_footer, function(key, val) {w.set_info_emp(key,val)});
          $.each(w.setting_footer_info, function(key, val) {w.set_info_emp(key,val)});
  
          if(cr.alive(w.setting_footer_info.footer_company_logo)) $("#footer_company_logo").attr("src",w.setting_footer_info.footer_company_logo);
          if(w.setting_fb_pixel.api_key_page!=""){
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init',w.setting_fb_pixel.api_key_page);
            fbq('track', 'PageView');
          }
          cr.show_menu_list("#menu_top","menu");

      },()=>{
        w.onLoad();
      });
    },(eror)=>{
      w.onLoad();
    });
  }

  get_data_paypal_payment(act_done=null){
    cr.msg_loading();
    cr_firestore.list("setting",datas=>{
      Swal.close();
      $.each(datas,function(index,setting){
        if(setting.id_doc=="setting_pay") w.setting_pay=setting;
        if(setting.id_doc=="setting_pp_1") w.paypal_app.push({"api_paypal":setting.api_paypal,"api_paypal_scenrest":setting.api_paypal_scenrest});
        if(setting.id_doc=="setting_pp_2") w.paypal_app.push({"api_paypal":setting.api_paypal,"api_paypal_scenrest":setting.api_paypal_scenrest});
        if(setting.id_doc=="setting_pp_3") w.paypal_app.push({"api_paypal":setting.api_paypal,"api_paypal_scenrest":setting.api_paypal_scenrest});
      });

      w.index_app_paypay_cur=parseInt(w.setting_pay.acc_paypal_sel);
      w.api_paypal=w.paypal_app[w.index_app_paypay_cur].api_paypal;
      w.api_paypal_scenrest=w.paypal_app[w.index_app_paypay_cur].api_paypal_scenrest;

      if(act_done) act_done();
    });
  }

  set_info_emp(key,val){
    if($("#"+key).length==0) return true;

    if(cr.alive(val)){
      $("#"+key).html(val);
    }else{
      $("#"+key).parent().remove();
    }
  }

  show_home(){
      $("#page_title").html(this.setting.title);
      $("#page_subtitle").html(this.setting.subtitle);
      $("#all_product_home").html('<b><i class="fas fa-spinner fa-spin"></i> Loading...</b>');
      cr_firestore.list("product", (datas) => {
          $("#all_product_home").empty();
          $.each(datas, function (index, p) {
              if(p.in_home!="1") return true;
              p.index=index;
              $("#all_product_home").append(w.product_item(p));
          });

          let htm_view_all_product='<div class="row">';
          htm_view_all_product+='<div class="col-12 text-center">';
          htm_view_all_product+='<div class="btn btn-outline-dark mt-auto cart-btn" onclick="w.show_all_product();return false;"><i class="fas fa-angle-double-right"></i> View All Products</div>';
          htm_view_all_product+='</div>';
          htm_view_all_product+='</div>';
          $("#all_product_home").append(htm_view_all_product);
      });      
      updateCartUI();
  }

  show_about(){
    cr.change_title("About Us","index.html?p=about");
    $("#page_title").html("About Us");
    cr.get("page/about.html",data=>{
      $("#page_containt").html(data);
      cr.top();
    });
    updateCartUI();
  }

  show_pay_done(){
    $("#page_title").html("Payment");
    cr.get("page/pay_done.html",data=>{
      $("#page_containt").html(data);
      
      if(w.data_bill!=null){
        cr_firestore.add(w.data_bill,"order",()=>{

        });
        w.add_order_pay();
      }
      w.get_token(cr.arg('authorization_id'));
      updateCartUI();
    });
    
  }

  show_cart(){
    cr.change_title("Cart","index.html?p=cart");
    cr.top();
    $("#page_title").html('<i class="fas fa-shopping-cart"></i> Cart');
    var html_cart='';
    html_cart+='<ul id="cart-items" class="list-group"></ul>';
    html_cart+='<div id="cart-total-sub" class="d-flex justify-content-between align-items-center mt-3">';
    html_cart+='<h4>Total: $0.00</h4>';
    html_cart+='</div>';
    html_cart+='<button id="checkout-btn" onclick="w.show_checkout();return false;" class="btn btn-outline-dark mt-3"><i class="bi bi-cart-check"></i> Proceed to Checkout</button>';
    $("#page_containt").html(html_cart);
    updateCartUI();
  }

  p_star(count) {
    if (count === "" || isNaN(count) || count < 0) count = 0;
    var count = parseInt(count);
    var html_star = '<div class="d-flex justify-content-center small mb-2 w-100 icons-start">';
    var maxStars = 5;
    for (var i = 1; i <= maxStars; i++) {
        if (i <= count) {
            html_star += '<i class="fas fa-star text-warning"></i>';
        } else {
            html_star += '<i class="far fa-star" style="color: #f3f314"></i>'; 
        }
    }
    html_star += '</div>';
    return html_star;
  }

  product_item(p){
    var img = '';
    if (p.image.trim() == "") img = 'https://dummyimage.com/450x300/dee2e6/6c757d.jpg';
    else img = p.image;
    var p_html = `
    <div class="col mb-5">
        <div class="card custom-card h-100">
            ${p.sale == "" ? '' : '<div class="badge bg-danger text-white position-absolute" style="top: 0.5rem; right: 0.5rem">Sale</div>'}    
            <!-- Product image-->    
            <img class="card-img-top img-prd" src="${img}" alt="..." />    
            <!-- Product details-->    
            <div class="card-body p-4">        
                <div class="text-center">            
                    <!-- Product name-->            
                    <a class="href-title" href="javascript:;"><b class="fw-bolder title-prd w-100 h-100" style="font-size:13px">${p.name}</b><br/></a>
                    ${w.p_star(p.star)}
                    <!-- Product price-->           
                    <span class="text-muted text-decoration-line-through">${p.sale}$</span> ${p.price}<b>$</b>    
                </div>
            </div>    
            <!-- Product actions-->    
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">        
                <div class="text-center">
                <div data-id="${p.index}" data-name="${p.name}" data-price="${p.price}"  onclick="w.add_cart(this);return false;" class="btn btn-outline-dark mt-auto cart-btn">
                    <i class="bi bi-cart-plus"></i> Add to cart
                </div>
                </div>
            </div>
        </div>
    </div>
    `;
    var emp_p = $(p_html);

    $(emp_p).find("img,a").click(() => {
        w.show_product_by_data(p);
        return false;
    });

    return emp_p;
  }

  show_pp(){
    cr.top();
    $("#page_title").html('Privacy Policy');
    cr.change_title("Privacy Policy","index.html?p=privacy_policy");
    cr.show_pp("#page_containt",()=>{
      $("#page_containt ul").remove();
    });
    updateCartUI();
  }

  show_tos(){
    cr.top();
    $("#page_title").html('Terms of service');
    cr.change_title("Terms of service","index.html?p=terms_of_service");
    cr.show_tos("#page_containt",()=>{

    });
    updateCartUI();
  }

  show_checkout(){
    cr.change_title("Checkout","index.html?p=checkout");
    cr.top();
    $("#page_title").html('<i class="fas fa-cart-arrow-down"></i> Checkout');
    cr.get("page/checkout.html",data=>{
      $("#page_containt").html(data);
      w.get_data_paypal_payment(()=>{
        setTimeout(()=>{
        // Tạo PayPal Button
          paypal.Buttons({
            createOrder: function (data, actions) {
              var allFilled = true;
              w.error_pay=false;
              

              $('input[required]').each(function() {
                if ($(this).val() === '') {
                  allFilled = false;
                  w.error_pay=true;
                  $(this).css('border', '2px solid red');
                } else {
                  $(this).css('border', '');
                }
              });

              if(allFilled==false){
                cr.msg("Please fill in all information!","Missing data","warning")
                return true;
              }else{
                let data_bill={};
                $('input').each(function() {
                    var id_field=$(this).attr("id");
                    data_bill[id_field]=$(this).val();
                });
                data_bill["orderNotes"]=$("#orderNotes").val();
                data_bill["paypal"]=(parseInt(w.index_app_paypay_cur)+1);
                data_bill["date"]=new Date().toLocaleString();
                w.data_bill=data_bill;
                localStorage.setItem("data_bill",JSON.stringify(data_bill));
              }
              // Lấy giá trị sản phẩm, phí vận chuyển và thuế từ DOM hoặc tính toán chúng
              var itemTotal = parseFloat($('#tt_price').html()); // Giá trị của sản phẩm
              var shippingCost = parseFloat(w.setting.shipping_price);
              var taxAmount = parseFloat(w.setting.tax_price);

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
              if(w.error_pay==false){
                Swal.fire({
                  icon: 'error',
                  title: 'Payment Error',
                  text: 'There was an issue with your payment. Please try again.',
                });
              }
            }
          }).render('#paypal-button-container');
        },1000);
        updateCartUI();
      });
    });
  }

  show_all_product(type="All Products"){
    cr.change_title(type,"index.html?p=all_products");
    cr.top();
    $("#page_title").html(type);
    $("#page_subtitle").html(this.setting.subtitle);
    $("#page_containt").html('<div class="row text-center"><div class="col-12"><b><i class="fas fa-spinner fa-spin"></i> Loading...</b></div></div>');
    cr_firestore.list("product", (datas) => {

      function search_product(key) {
        var result = $.grep(datas, function(datas) {
            return datas.name.toLowerCase().indexOf(key.toLowerCase()) !== -1;
        });
        return result;
      }

      if(type=='Popular Items'){
        datas.sort(function(a, b) {
          return parseInt(b.star) - parseInt(a.star);
        });
      }else if(type=='Ascending price'){
        datas.sort(function(a, b) {
          return parseInt(a.price) - parseInt(b.price);
        });
      }else if(type=='Descending price'){
        datas.sort(function(a, b) {
          return parseInt(b.price) - parseInt(a.price);
        });
      }else if(type=='All Products'){

      }else{
        datas=search_product(type);
        $("#page_title").html('Found '+datas.length+' results related to "'+type+'"');
      }

      if(datas.length>0){
        $("#page_containt").html('<div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center" id="all_product_home"></div>');
        $.each(datas, function (index, p) {
          p.index = index;
          $("#all_product_home").append(w.product_item(p));
        });
      }else{
        $("#page_containt").html('<div class="row"><div class="col-12 text-center"><b><i class="fas fa-frown"></i></br>No Products!</b></div></div>');
      }
      updateCartUI();
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

  show_search(){
    cr.showSearch((key)=>{
      w.show_all_product(key);
      updateCartUI();
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
      html_p+='<div class="col-md-8 col-12 col-lg-8">';
        html_p+='<strong>'+data.name+'</strong><br/>';
        html_p+='<b style="font-size:30px;">'+data.price+'$</b><br/>';
        if(cr.alive(data.sale)) html_p+='<b  class="badge bg-danger text-white m-1">Sale</b> <span class="text-muted text-decoration-line-through">$'+data.sale+'</span> <br/>';
        html_p+='<a onclick="w.add_cart(this);return false;" data-id="'+data.index+'" data-name="'+data.name+'" data-price="'+data.price+'" class="btn btn-outline-dark mt-auto cart-btn" href="#"><i class="bi bi-cart-plus"></i> Add to cart</a> ';
        html_p+='<a onclick="cr.show_share();return false;" class="btn btn-outline-dark mt-auto cart-btn" href="#"><i class="fas fa-share-alt"></i> Share</a><br/><br/>';
        html_p+=data.tip;
      html_p+='</div>';
    html_p+='</div>';
    html_p+='</div>'
    $("#page_title").html(data.name);
    $("#page_containt").html(html_p);
    updateCartUI();
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
              "Authorization": "Basic " + btoa(w.api_paypal+":"+w.api_paypal_scenrest),
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

  add_order_pay(){
    w.setting_pay.order_paypal_count=parseInt(w.setting_pay.order_paypal_count)+1;
    if(w.setting_pay.order_paypal_count>20) w.setting_pay.acc_paypal_sel=2;
    else if(w.setting_pay.order_paypal_count>10) w.setting_pay.acc_paypal_sel=1;
    else w.setting_pay.acc_paypal_sel=0;
    cr_firestore.set(w.setting_pay,"setting","setting_pay",()=>{
      w.clear_cart();
    });
  }

  clear_cart(){
    localStorage.setItem('cart',"[]");
    updateCartUI();
  }
}
var w=new Web();

$(document).ready(function () {

  // Remove product from cart
  $(document).on('click', '.remove-btn', function () {
    const id = $(this).data('id');
    removeFromCart(id);
    updateCartUI();
  });

  cr.site_name="My Shop";
  cr.site_url="https://payshop.vercel.app/";
  cr.onLoad();
  cr.add_btn_top();

  w.onLoad();
});