module.exports = (phase) => { 
    this.ds = require('./datasource/rdb')(phase);
    this.config_repository = require('./repository/config_repository')(this);

    // 신협
    this.credit_union_batch_transaction_repository = require('./repository/credit_union_batch_transaction_repository')(this);
    this.credit_union_region_repository = require('./repository/credit_union_region_repository')(this);
    this.credit_union_local_repository = require('./repository/credit_union_local_repository')(this);
    this.credit_union_store_repository = require('./repository/credit_union_store_repository')(this);
    this.credit_union_product_repository = require('./repository/credit_union_product_repository')(this);

    this.credit_union_remote = require('./remote/credit_union_remote');

    this.credit_union_service = require('./service/credit_union_service')(this);

    // 새마을금고
    this.kfcc_remote = require('./remote/kfcc_remote');
    return this;
};

