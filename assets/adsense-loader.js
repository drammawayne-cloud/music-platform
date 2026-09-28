// Add the actual publisher ID in adsense-config.js after creating an AdSense account.
// No Google ad request is made until a valid ID is configured.
(()=>{
 const id=window.RR_ADSENSE_CLIENT;
 if(typeof id!=='string'||!/^ca-pub-\d{16}$/.test(id))return;
 if(document.querySelector('script[data-rr-adsense]'))return;
 const script=document.createElement('script');script.async=true;script.crossOrigin='anonymous';
 script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(id)}`;
 script.dataset.rrAdsense='';document.head.append(script);
})();
