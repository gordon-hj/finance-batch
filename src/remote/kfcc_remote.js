const request = require('request');
const cheerio = require('cheerio');

exports.getRegions = function() {
    return new Promise((resolve, reject) => 
        request({
            uri: 'https://www.kfcc.co.kr/map/main.do',
            method: 'GET',
            // encoding: null,
            // headers: [{name: 'Content-Type', value: 'text/html; charset=UTF-8'}],
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
            var regions = new Map()
            parsed.map(e => {
                var vs = e.split('"').map(e => e.trim()).filter(e => (e.includes(',')==false) && e.length > 0)    
                console.log(vs)
                regions.set(vs[0], vs.slice(1))
            })
            console.log(regions)

            console.debug('새마을금고 지역단위 조회 => ', regions);
            resolve(regions);
        }
))};