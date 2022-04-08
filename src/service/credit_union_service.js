module.exports = (context) => { 
    this.credit_union_batch_transaction_repository = context.credit_union_batch_transaction_repository;
    this.credit_union_region_remote = context.credit_union_region_remote;
    this.credit_union_region_repository = context.credit_union_region_repository;
    return this;
};

exports.do = () => {
    var date = new Date().toISOString().slice(0, 10);
    this.credit_union_batch_transaction_repository.findLastestNotDone(date)
    .then((transaction) => {
        if(transaction == null) {
            return this.credit_union_batch_transaction_repository.save(date, "REGIONS", null, "START")
            .then(this.credit_union_batch_transaction_repository.findById)
        } else {
            return new Promise((resolve, reject) => { resolve(transaction) })
        }
    })
    .then((transaction) => {
        if(transaction.status == "FAIL") {
            console.log("신협 배치 트랜잭션 정지 상태");
        } else {
            console.log('신협 배치 트랜잭션 실행 id : ' + transaction.id);
            return getRegions(transaction);
        }
    })
}

let getRegions = (transaction) => {
    console.log('신협 광역단위 수집');
    return this.credit_union_region_remote.getRegions()
            .then((regions) => {
                this.credit_union_region_repository.save(regions)
                .then((result) => { this.credit_union_batch_transaction_repository.update(transaction.id, "DONE", JSON.stringify(regions))})
                .catch((err) => {
                    var nextStatus = (transaction.status == "START") ? "RETRY" : "FAIL";
                    this.credit_union_batch_transaction_repository.update(transaction.id, nextStatus, JSON.stringify(err));
                })
            })
        };