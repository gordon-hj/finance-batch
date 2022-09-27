// TODO phase process.env
const phase = process.argv[2];
console.log("Request phase =>", phase);
const cron = require('node-cron');
const context = require('./context')(phase);


// 12초에 한 번씩 배치
cron.schedule('*/12 * * * * *', function () {
    context.config_repository.findByKey('batch-allow')
    .then((result) => {
        if(result.value == true) {
            context.credit_union_service.do();
        } else {
            console.log('신협 배치 방어 처리 되어있습니다. 실행 시키려면 config를 수정하세요.');
        }
    })
}).start();

// 20초에 한 번씩 배치
cron.schedule('*/20 * * * * *', function () {
    context.config_repository.findByKey('kfcc-batch-allow')
    .then((result) => {
        if(result.value == true) {
            context.kfcc_service.do();
        } else {
            console.log('새마을금고 배치 방어 처리 되어있습니다. 실행 시키려면 config를 수정하세요.');
        }
    })
}).start();
