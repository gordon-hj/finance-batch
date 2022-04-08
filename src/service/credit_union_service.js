module.exports = (context) => { 
    this.credit_union_batch_transaction_repository = context.credit_union_batch_transaction_repository;
    this.credit_union_region_remote = context.credit_union_region_remote;
    this.credit_union_region_repository = context.credit_union_region_repository;
    return this;
};


exports.do = () => {
    this.credit_union_batch_transaction_repository.findLastestNotDone(new Date())
    .then((transaction) => {
        if(transaction == null) {
            console.log('신협 배치 최초 실행 => 기준 : ' + new Date());
            getRegions();
        } else {
            console.log('신협 배치 트랜잭션 실행');
            console.log(transaction);
        }
    });
}

let getRegions = () => {
    // credit_union_batch_transaction_repository.insert
    this.credit_union_region_remote.getRegions()
    .then((regions) => {
        console.debug(regions);
        this.credit_union_region_repository.insert(regions);
        // credit_union_batch_transaction_repository.update
    }, () => {
        // credit_union_batch_transaction_repository.update
    })
};