module.exports = (context) => { 
    this.kfcc_batch_transaction_repository = context.kfcc_batch_transaction_repository;
    this.kfcc_region_repository = context.kfcc_region_repository;
    this.kfcc_store_repository = context.kfcc_store_repository;
    this.kfcc_product_repository = context.kfcc_product_repository;
    this.kfcc_remote = context.kfcc_remote;
    return this;
};

exports.do = () => {
    var date = new Date().toISOString().slice(0, 10);
    this.kfcc_batch_transaction_repository.findOldestNotDone(date)
    .then((transaction) => {
        if(transaction == null) {
            this.kfcc_batch_transaction_repository.exists(date)
            .then((result) => {
                if(result == true) {
                    console.log("새마을금고 배치 완료")
                    return
                }
                else {
                    console.log("새마을금고 신규 트랜잭션 시작");
                    return this.kfcc_batch_transaction_repository.save(date, "REGIONS", null, "START")        
                }
            })
        } 
        else if(transaction.status == 'END') {
            return;
        } else if(transaction.status == 'FAIL') {
            console.log("새마을금고 트랜잭션 정지 상태");
            return;
        } else if(transaction.status == 'REQUESTED') {
            console.log("새마을금고 트랜잭션 요청 상태");
            return;
        } else {
            return doTransaction(transaction, date)
            .then((nextTrans) => {
                if(nextTrans != null)
                    this.kfcc_batch_transaction_repository.update(transaction.id, "DONE", null)
                    .then(this.kfcc_batch_transaction_repository.saveAll(date, nextTrans, "START"))
                else 
                    this.kfcc_batch_transaction_repository.update(transaction.id, "END", null)
            })
            .catch((err) => {
                console.log(err)
                var nextStatus = (transaction.status == "START") ? "RETRY" : "FAIL";
                this.kfcc_batch_transaction_repository.update(transaction.id, nextStatus, JSON.stringify(err));
            })
        }
    })
}


let doTransaction = (transaction, date) => {
    this.kfcc_batch_transaction_repository.update(transaction.id, "REQUESTED", null)
    console.log('새마을금고 트랜잭션 실행 id : ' + transaction.id);
    switch(transaction.type) {
        case "REGIONS" : 
            console.log('새마을금고 지역단위 수집');
            return this.kfcc_remote.getRegions()
            .then((regions) => this.kfcc_region_repository.save(regions, date))
            .then((regions) => new Promise(resolve => { resolve(regions.map(v => { return {type:"STORES", typeId:v.id} })) }))
        case "STORES" : 
            console.log('새마을금고 금고단위 수집 => 지역단위 ID : ' + transaction.typeId);
            return this.kfcc_region_repository.findById(transaction.typeId, date)
            .then((region) => {
                return this.kfcc_remote.getStores(region.regionName, region.localName)
                .then((stores) => this.kfcc_store_repository.save(region.id, stores, date))
                .then((stores) => new Promise(resolve => { resolve(stores.map(v => { return {type:"PRODUCTS", typeId:v.id} })) }))
            })
        case "PRODUCTS" : 
            console.log('새마을금고 상품단위 수집 => 금고단위 ID : ' + transaction.typeId);
            return this.kfcc_store_repository.findById(transaction.typeId, date)
            .then((store) => {
                if(store == null) {
                    return new Promise(resolve => { resolve(null) })
                }
                return this.kfcc_remote.getProducts(store.code)
                .then((products) => this.kfcc_product_repository.save(store.id, products, date))
                .then(() => new Promise(resolve => { resolve(null) }))
            })
        default :
            console.error("잘못된 새마을금고 트랜잭션이 존재합니다.", transaction);
            return;
    }
}
