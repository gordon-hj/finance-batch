const request = require('request');
const cheerio = require('cheerio');

exports.getRegions = function() {
    return new Promise((resolve, reject) => 
        request({
            uri: 'https://www.kfcc.co.kr/map/main.do',
            method: 'GET',
        },
        function(err, res, body){
            if(err) {
                console.error("Request Error !! ==> " + err);
                reject(err);
            }
            var parsed = body
            .replace(/\r/g, '')
            .replace(/\t/g, '')
            .replace(/\n/g, '')
            .split('[')
            .map(e => e.split(']'))
            .flat()
            .map(v => v.trim())
            .filter(v => v != '')
            .filter(v => 
                (v.includes('<') == false)
                 && (v.includes('>') == false)
                 && (v.includes('시') || v.includes('군') || v.includes('구'))
            )
            var regions = []
            parsed.map(e => {
                var vs = e.split('"').map(e => e.trim()).filter(e => (e.includes(',')==false) && e.length > 0)    
                if(vs[0] == '세종') { // 세종시는 기초단위가 없는 것으로 간주함;
                    regions.push({regionName:vs[0], localName:null})
                } else {
                    vs.slice(1).map(e => {
                        regions.push({regionName:vs[0], localName:e})
                    })
                }
            })

            console.debug('새마을금고 지역단위 조회 => ', regions);
            resolve(regions);
        }
))};

exports.getStores = function(regionName, localName) {
    return new Promise((resolve, reject) => 
        request({
            uri: `https://www.kfcc.co.kr/map/list.do?r1=${encodeURI(regionName)}&r2=${encodeURI(localName)}`,
            method: 'GET',
        },
        function(err, res, body){
            if(err) {
                console.error("Request Error !! ==> " + err)
                reject(err)
            }
            const $ = cheerio.load(body, {decodeEntities: false});
            var storeRaws = $('td.no').map((_, r) => {
                var store = {}
                cheerio.load(r)('span').map((_, e) => {
                    if(e.children[0] != undefined) {
                        store[e.attribs.title] = e.children[0].data
                    } 
                })
                return store
            }).filter((_, e) => e.divCd == '001') // 본점만 조회(지점은 본점과 같음)  
            var stores = Array.from(storeRaws)  

            console.debug('새마을금고 금고 조회 => ', stores);
            resolve(stores)
        }
))};

exports.getProducts = function(gmgoCd) {
    return new Promise((resolve, reject) => 
        request({
            uri: `https://www.kfcc.co.kr/map/goods_19.do`,
            method: 'POST',
            form: {OPEN_TRMID:gmgoCd, gubuncode:13}, // 13: 예금, 14: 적금
        },
        function(err, res, body){
            if(err) {
                console.error("Request Error !! ==> " + err)
                reject(err)
            }
            const $ = cheerio.load(body, {decodeEntities: false});
            var productRaws = $("div[id^='divTmp']")
            .filter((_, e) => e.attribs.style != 'display: none')
            .map((_, e) => {
                var t = cheerio.load(e)
                var product = {}
                product.name = t('.tbl-tit')[0].children[0].data
                product.interests = new Map()
                t('tbody tr').map((i, a) => {
                    var tds = cheerio.load(a)('td')
                    var periodIndex = (i == 0) ? 1 : 0
                    var interestIndex = (i == 0) ? 2 : 1
                    var period = tds[periodIndex].children[0].data
                    var interest = tds[interestIndex].children[0].data
                    product.interests.set(period, interest)
                })
                return product
            })

            var products = Array.from(productRaws)
            console.log(products)

            // console.debug('새마을금고 금고 상품 조회 => ', products);
            resolve(products)
        }
))};