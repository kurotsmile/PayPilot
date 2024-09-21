class Web{
  setting_fb_pixel=null;

  onLoad(){
    w.data_bill=JSON.parse(localStorage.getItem('data_bill')) || [];
    cr.get_json("config.json",(config_data)=>{
      cr_firestore.id_project = config_data.id_project;
      cr_firestore.api_key = config_data.api_key;
      cr_firestore.list("setting",datas=>{
        $.each(datas,function(index,setting){
          if(setting.id_doc=="setting_fb_pixel") w.setting_fb_pixel=setting;
        });

        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init',w.setting_fb_pixel.api_key_register);
        fbq('track', 'PageView');

      },()=>{
        w.onLoad();
      });
    },(eror)=>{
      w.onLoad();
    });
  }
}

var w=new Web();

$(document).ready(function () {
    cr.site_name="My Shop";
    cr.onLoad();
    cr.add_btn_top();
    w.onLoad();
  });