module.exports = (phase) => { 
    this.ds = require('./datasource/rdb')(phase);
    this.config_repository = require('./repository/config_repository')(this);

    this.credit_union_batch_transaction_repository = require('./repository/credit_union_batch_transaction_repository')(this);
    this.credit_union_region_repository = require('./repository/credit_union_region_repository')(this);

    this.credit_union_region_remote = require('./remote/credit_union_region_remote');

    this.credit_union_service = require('./service/credit_union_service')(this);
    return this;
};

