const request = require('request');

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
            console.debug('신협 광역 단위 조회 => ' + JSON.stringify(regions));
            resolve(regions);
        }
    ))};