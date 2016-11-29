/**
 * Start application
 */


function service(dom) {

    var renderContent = dom.getAttribute('render');
    var url = dom.getAttribute('source');
    var listen = dom.getAttribute('listen');

    var attr = ['render', 'source', 'listen'];

    for (var i = 0, len = attr.length; i < len; i++)
        dom.removeAttribute(attr[i]);

    //Servisten bilgileri altık
    servisim(url, function(data) {

        //Örnek @(experience.marka) benzeyen verileri bize liste halinde verdi
        var matchResult = renderContent.match(/\@\((.*?)?\)/g);

        var all = [];
        if (data && data.length) {
            //Servisten gelen kayıt sayısı kadar döngü oluşturalım
            for (var i = 0, len = data.length; i < len; i++) {

                var result = {};
                find(data[i], "", result);
                all.push(replaceModel(matchResult, renderContent, result, i, data[i]));
            }


        } else if (data && typeof data == 'object') {

            var result = {};
            find(data, "", result);
            all.push(replaceModel(matchResult, renderContent, result, 0, data));
        }


        dom.innerHTML = all.join('\n');
        all = null;

    });

}


function replaceModel(match, renderContent, table, index, dataorigin) {

    var result = renderContent;
    for (var i = 0, len = match.length; i < len; i++) {

        //Grouplayalım
        var group = (/\@\((.*?)?\)/g).exec(match[i]);

        if (!table.hasOwnProperty(group[1]))
            throw 'Servis tarafından gelen data içerisindeki ' + (index + 1) + '. kayıtta \"' + group[1] + '\" alanı bulunamadı.\n\n' + JSON.stringify(dataorigin);

        if (group != null)
            result = result.replace(new RegExp('\\@\\(' + group[1] + '\\)', 'g'), table[group[1]]);

    }

    return result;

}


function find(data, result, app) {

    for (var key in data) {

        dal(key, data[key], result, app);

    }
}


function birlestir(value1, value2) {
    if (!value1) return value2;
    return value1 + '.' + value2;
}


function dal(key, value, result, app) {

    var response = result ? result : "";
    response = birlestir(response, key);
    if (typeof value !== "object") {
        app[response] = value;
    } else {
        find(value, response, app);
    }

}



service(document.querySelector('[source][render]'));