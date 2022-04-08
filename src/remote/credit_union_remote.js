const request = require('request');
const cheerio = require('cheerio');

exports.getRegions = function() {
    return new Promise((resolve, reject) => 
        request({
            uri: 'http://www.cu.co.kr/cu/ad/ctprvn.do',
            method: 'POST',
        }, 
        function(err, res, body){
            if(err) {
                console.error("Request Error !! ==> " + err);
                reject(err);
            }
            var regions = JSON.parse(body)
            console.debug('신협 광역단위 조회 => ' + JSON.stringify(regions));
            resolve(regions);
        }
))};

exports.getLocals = function(regionCode) {
    return new Promise((resolve, reject) => 
        request({
            uri: 'http://www.cu.co.kr/cu/ad/signgu.do',
            method: 'POST',
            headers: [{name: 'content-type', value: 'application/x-www-form-urlencoded'}],
            form: {ctprvn:regionCode},
        }, 
        function(err, res, body){
            if(err) {
                console.error("Request Error !! ==> " + err);
                reject(err);
            }
            var locals = JSON.parse(body).map(value => {
                var local = {}; 
                local.local_code = value.guCd;
                local.local_name = value.guNm;
                local.region_code = regionCode;
                return local;
            })
            console.debug('신협 지역단위 조회 => ' + JSON.stringify(locals));
            resolve(locals);
        }
))};

exports.getStores = function(regionCode, localCode) {
    return new Promise((resolve, reject) =>
        request({
            uri: 'http://www.cu.co.kr/cu/ad/inrstGuidanceList.do',
            method: 'POST',
            headers: [{name: 'content-type', value: 'application/x-www-form-urlencoded'}],
            form: {ctprvn:regionCode, signgu:localCode},
            },
            function(err, res, body){
                if(err) {
                    console.log("Request Error !! ==> " + err);
                    reject(err);
                } else {
                    // parse store code
                    const $ = cheerio.load(body, {decodeEntities: false});
                    var stores = $('[onclick^="fn_selectCuInfo"]').map((index, element) => {
                        var code = element.attribs.onclick.split('\'')[1];
                        var name = element.children[0].data;
                        var store = {}; 
                        store.store_code = code;
                        store.store_name = name;
                        store.local_code = localCode;
                        return store
                    });
                    var uniqueStoreCodes = [];
                    var uniqueStores = [];
                    Array.from(stores).map((store) => {
                        var unique = uniqueStoreCodes.filter((code) => { return code == store.store_code }).length == 0;
                        if(unique) {
                            uniqueStores.push(store);
                            uniqueStoreCodes.push(store.store_code);
                        }
                    })
                    console.debug('신협 조합단위 조회 => ' + JSON.stringify(uniqueStores));
                    resolve(uniqueStores);
                }
            }
        )
    );
}

exports.getProducts = function(storeCode) {
    return new Promise((resolve, reject) =>
    request({
        uri: 'http://www.cu.co.kr/cu/ad/inrst/selectInrstGuidanceList.do',
        method: 'POST',
        headers: [{name: 'content-type', value: 'application/x-www-form-urlencoded'}],
        form: {cuIngno:storeCode, targetTabMenu:'dpst'},
        },
        function(err, res, body){
            if(err) {
                console.log("Request Error !! ==> " + err);
                reject(err);
            } else {
                // parse store code
                const $ = cheerio.load(body, {decodeEntities: false});
                var codes = $('[onclick^="fn_selectStock"]').map((index, element) => {
                    var code = element.attribs.onclick.split('\'')[3];
                    var name = element.children[0].data;
                    var product = {};
                    product.store_code = storeCode;
                    product.product_code = code;
                    product.product_name = name;
                    return product;
                });
                var products = Array.from(codes);
                console.debug('신협 상품단위 조회 => ' + JSON.stringify(products));
                resolve(products);
            }
        }
    )
    )
}

exports.getProductDetail = function(storeCode, productCode) {
    return new Promise((resolve, reject) => {
        var uri = null
        if(productCode.slice(0, 2) == '15') uri = 'http://www.cu.co.kr/cu/ad/inrst/selectInrst15GuidanceList.do'
        else uri = 'http://www.cu.co.kr/cu/ad/inrst/selectInrst17GuidanceList.do'
        request({
            uri: uri,
            method: 'POST',
            headers: [{name: 'content-type', value: 'application/x-www-form-urlencoded'}],
            form: {cuIngno:storeCode, stockCode:productCode},
            },
            function(err, res, body){
                if(err) {
                    console.log("Request Error !! ==> " + err);
                    reject(err);
                } else {
                    // parse store code
                    const $ = cheerio.load(body, {decodeEntities: false});
                    var values = $('tbody > tr:first-child > td').map((index, element) => {
                        if(element.firstChild.data != null) {
                            return element.firstChild.data;
                        }
                    });
                    var interest = Array.from(values)[4];
                    console.debug('신협 상품단위 조회 => store_code : ' + storeCode + ', product_code : ' + productCode + " => " + interest);
                    resolve(interest);
                }
            }
        );
    }
    )
}
