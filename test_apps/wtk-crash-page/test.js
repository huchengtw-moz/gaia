window.addEventListener('load', function() {
  document.body.textContent = 'start to crash the page';
  var txt = 'a';
  while(1){
      txt = txt += 'a';    //add as much as the browser can handle
  }
});
