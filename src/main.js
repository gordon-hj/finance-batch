// TODO phase process.env
const phase = process.argv[2];
console.log("Request phase =>", phase);
const cron = require('node-cron');
const rdb = require('./datasource/rdb')(phase);
const config_repository = require('./repository/config_repository')(rdb);
const credit_union_batch_transaction_repository = require('./repository/credit_union_batch_transaction_repository')(rdb);
const credit_union_region_remote = require('./remote/credit_union_region_remote');
const credit_union_region_repository = require('./repository/credit_union_region_repository')(rdb);

// 1분에 한 번씩 배치
// cron.schedule('* * * * *', function () {
    config_repository.findByKey('batch-allow')
    .then((result) => {
        console.log(result);
        if(result.value == true) {
            console.log('신협 배치 실행');
            return credit_union_batch_transaction_repository.findLastestNotDone(new Date());
        } else {
            console.log('신협 배치 방어 처리 되어있습니다. 실행 시키려면 config를 수정하세요.');
        }
    }).then((transaction) => {
        if(transaction == null) {
            console.log('신협 배치 최초 실행 => 기준 : ' + new Date());
            return credit_union_region_remote.getRegions();
        } else {
            console.log('신협 배치 트랜잭션 실행');
            console.log(transaction);
        }
    }).then((regionals) => {
        console.log(regionals);
        return credit_union_region_repository.insert(regionals);
    })
// }).start();
