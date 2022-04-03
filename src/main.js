// TODO phase process.env
const phase = process.argv[2];
console.log("Request phase =>", phase);
const cron = require('node-cron');
const rdb = require('./datasource/rdb')(phase);
const config_repository = require('./repository/config_repository')(rdb);

// 1분에 한 번씩 배치
cron.schedule('* * * * *', function () {
    config_repository.selectByKey('batch-allow')
    .then((result) => {
        console.log(result);
        if(result.value == true) {
            console.log('배치 실행');
        } else {
            console.log('배치 방어 처리 되어있습니다. 실행 시키려면 config를 수정하세요.');
        }
    })
}).start();
  