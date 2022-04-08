// TODO phase process.env
const phase = process.argv[2];
console.log("Request phase =>", phase);
const cron = require('node-cron');
const context = require('./context')(phase);


// 1분에 한 번씩 배치
// cron.schedule('* * * * *', function () {
    context.config_repository.findByKey('batch-allow')
    .then((result) => {
        console.log(result);
        if(result.value == true) {
            console.log('신협 배치 실행');
            context.credit_union_service.do();
        } else {
            console.log('신협 배치 방어 처리 되어있습니다. 실행 시키려면 config를 수정하세요.');
        }
    })
// }).start();
