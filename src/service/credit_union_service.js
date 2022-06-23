module.exports = (context) => { 
    this.credit_union_batch_transaction_repository = context.credit_union_batch_transaction_repository;
    this.credit_union_remote = context.credit_union_remote;
    this.credit_union_region_repository = context.credit_union_region_repository;
    this.credit_union_local_repository = context.credit_union_local_repository;
    this.credit_union_store_repository = context.credit_union_store_repository;
    this.credit_union_product_repository = context.credit_union_product_repository;
    return this;
};

exports.do = () => {
    var date = new Date().toISOString().slice(0, 10);
    this.credit_union_batch_transaction_repository.findLastestNotDone(date)
    .then((transaction) => {
        if(transaction == null) {
            console.log("신협 신규 트랜잭션 시작");
            return this.credit_union_region_repository.deleteAll()
            .then(() => { return this.credit_union_batch_transaction_repository.save(date, "REGIONS", null, "START")})
        } else if(transaction.status == 'END') {
            return;
        } else if(transaction.status == 'FAIL') {
            console.log("신협 트랜잭션 정지 상태");
            return;
        } else if(transaction.status == 'REQUESTED') {
            console.log("신협 트랜잭션 요청 상태");
            return;
        } else {
            return doTransaction(transaction, date)
            .then((nextTrans) => {
                if(nextTrans != null)
                    this.credit_union_batch_transaction_repository.update(transaction.id, "DONE", null)
                    .then(this.credit_union_batch_transaction_repository.save(date, nextTrans[0], nextTrans[1], "START"))
                else 
                    this.credit_union_batch_transaction_repository.update(transaction.id, "END", null)
            })
            .catch((err) => {
                console.log(err)
                var nextStatus = (transaction.status == "START") ? "RETRY" : "FAIL";
                this.credit_union_batch_transaction_repository.update(transaction.id, nextStatus, JSON.stringify(err));
            })
        }
    })
}

let doTransaction = (transaction, date) => {
    this.credit_union_batch_transaction_repository.update(transaction.id, "REQUESTED", null)
    console.log('신협 트랜잭션 실행 id : ' + transaction.id);
    switch(transaction.type) {
        case "REGIONS" : 
            console.log('신협 광역단위 수집');
            return this.credit_union_remote.getRegions()
            .then((regions) => this.credit_union_region_repository.save(regions, date))
            .then(() => new Promise((resolve, reject) => { resolve(["LOCALS", 0]) }))
        case "LOCALS" : 
            console.log('신협 지역단위 수집 => 광역단위 ID : ' + transaction.typeId);
            return this.credit_union_region_repository.findByIdGte(transaction.typeId, date)
            .then((region) => {
                if(region == null) {
                    return new Promise((resolve, reject) => { resolve(["STORES", 0]) })
                }
                return this.credit_union_remote.getLocals(region.regionalCode)
                .then((locals) => this.credit_union_local_repository.save(locals, date))
                .then(() => new Promise((resolve, reject) => { resolve(["LOCALS", region.id + 1]) }))
            })
        case "STORES" : 
            console.log('신협 조합단위 수집 => 지역단위 ID : ' + transaction.typeId);
            return this.credit_union_local_repository.findByIdGte(transaction.typeId, date)
            .then((local) => {
                if(local == null) {
                    return new Promise((resolve, reject) => { resolve(["PRODUCTS", 0]) })
                }
                return this.credit_union_remote.getStores(local.regionCode, local.localCode)
                .then((stores) => this.credit_union_store_repository.save(stores, date))
                .then(() => new Promise((resolve, reject) => { resolve(["STORES", local.id + 1]) }))
            })
        case "PRODUCTS" : 
            console.log('신협 상품단위 수집 => 조합단위 ID : ' + transaction.typeId);
            return this.credit_union_store_repository.findByIdGte(transaction.typeId, date)
            .then((store) => {
                if(store == null) {
                    return new Promise((resolve, reject) => { resolve(["PRODUCT_INTEREST", 0]) })
                }
                return this.credit_union_remote.getProducts(store.storeCode)
                .then((products) => this.credit_union_product_repository.save(products, store.localCode, date))
                .then(() => new Promise((resolve, reject) => { resolve(["PRODUCTS", store.id + 1]) }))
            })
        case "PRODUCT_INTEREST" : 
            console.log('신협 상품금리 수집 => 상품단위 ID : ' + transaction.typeId);
            return this.credit_union_product_repository.findByIdGte(transaction.typeId, date)
            .then((product) => {
                if(product == null) return null
                return this.credit_union_remote.getProductDetail(product.storeCode, product.productCode)
                .then((interest) => this.credit_union_product_repository.updateInterestById(product.id, interest))
                .then(() => new Promise((resolve, reject) => { resolve(["PRODUCT_INTEREST", product.id + 1]) }))
            })
        default :
            console.error("잘못된 신협 트랜잭션이 존재합니다." + transaction);
            return;
    }
}
