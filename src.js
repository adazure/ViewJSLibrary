 function servisim(url, method) {

     var xml = new XMLHttpRequest();
     xml.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {

             method(JSON.parse(this.responseText));

         }
     }
     xml.open('GET', url, true);
     xml.send();

 }