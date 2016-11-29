/**
 * Start application
 */


(function service() {

    service.init = function() {

        var serviceList = document.querySelectorAll('[source][render]');
        for (var i = 0, len = serviceList.length; i < len; i++)
            new service.addModel(serviceList[i]);

    }

    service.listen = function(process, listen) {

        if (listen > 0)
            setTimeout(process, listen);
    }

    service.addModel = function(model) {

        var renderContent = model.getAttribute('render');
        var source = model.getAttribute('source');
        var listen = model.getAttribute('listen');

        var attr = ['render', 'source', 'listen'];

        if (listen > 0) {
            listen *= 1000;
        }



        for (var i = 0, len = attr.length; i < len; i++)
            model.removeAttribute(attr[i]);



        (function process() {

            if (!window[source] && source.indexOf('/') != -1)
                service.ajax({

                    url: source,
                    success: function(data, xml) {

                        /**
                         * XMLRequest sonrası gelen datayı işleyelim
                         * 
                         */

                        successResult(data);
                        service.listen(process, listen);

                    }

                });
            else if (window[source] && typeof window[source] == 'object') {
                successResult(window[source]);
                service.listen(process, listen);
            }

        })()

        function successResult(data) {

            //Örnek @(experience.marka) benzeyen verileri bize liste halinde versin
            var matchResult = renderContent.match(/\#(.*?)?\#/g);

            //Servisten gelen her bir verinin işlendikten sonra tutulacağı değişkenimiz
            var results = [];

            if (data && !data.length)
                data = [data];

            modelParse(matchResult, renderContent, data, results);

            model.innerHTML = results.join('\n');
            results = null;

        }

        function modelParse(matchResult, renderContent, data, results) {


            //Servisten gelen kayıt sayısı kadar döngü oluşturalım
            for (var i = 0, len = data.length; i < len; i++) {

                /**
                 * Servisten gelen her bir datanın sahip olduğu property name
                 * ve value değerlerini bulup bir bizim istediğimiz gibi bir şekle dönüştürecek
                 * Bunun için dönüşüm işlemlerinin uygulandığı bir değişken ile
                 * datanın kendisini service.findProperties methoduna gönderiyoruz
                 * Çıktı olarak örnek result = {} nesnesine
                 * result = {
                 *  name:'John',
                 *  lastname:'SMITH',
                 *  age:49,
                 *  comments.id = 10,
                 *  comments.comment = 'lorem ipsum',
                 *  comments.likes = 10,
                 *  address.home.city = 'Newyork',
                 *  address.home.street = 'Rokyar'
                 * }
                 */

                var itemResult = {};
                service.findProperties(data[i], "", itemResult);
                results.push(replaceModel(matchResult, renderContent, itemResult, data[i]));
            }
        }


        function replaceModel(matchResult, renderContent, table, dataorigin) {

            var result = renderContent;
            if (matchResult != null) {
                for (var i = 0, len = matchResult.length; i < len; i++) {

                    //Grouplayalım
                    var group = (/\#(.*?)?\#/g).exec(matchResult[i]);

                    if (!table.hasOwnProperty(group[1]))
                        throw 'Servis tarafından gelen data içerisinde \"' + group[1] + '\" alanı bulunamadı.\n\n' + JSON.stringify(dataorigin);

                    if (group != null)
                        result = result.replace(new RegExp('\\#' + group[1] + '\\#', 'g'), table[group[1]]);

                }
            }

            return result;

        }


    }

    service.findProperties = function(data, result, app) {
        for (var key in data) {
            service.addToPropertyList(key, data[key], result, app);
        }
    }

    service.ConcatString = function(value1, value2) {
        if (!value1) return value2;
        return value1 + '.' + value2;
    }


    service.addToPropertyList = function(key, value, result, app) {

        var response = result ? result : "";
        response = service.ConcatString(response, key);
        if (typeof value !== "object") {
            app[response] = value;
        } else {
            service.findProperties(value, response, app);
        }

    }

    service.ajax = function(model) {

        var xml = new XMLHttpRequest();
        xml.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                model.success(JSON.parse(this.responseText), xml);
            }
        }

        if (model.cache && typeof model.cache === 'false') {
            model.url += (model.url.indexOf('?') != -1 ? '&' : '?') + 'dt_ts=' + new Date().getTime();
        }

        if (!model.method)
            model.method = 'GET';

        if (!model.async)
            model.async = true;


        xml.open(model.method, model.url, model.async);
        xml.send(model.data);

    }

    service.init();

})()