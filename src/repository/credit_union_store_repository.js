module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'credit_union_store';
const columns = ['id', 'store_code', 'store_name', 'local_code'];
class CreditUnionStore {
    constructor(result) {
        this.id = result.id;
        this.storeCode = result.store_code;
        this.storeName = result.store_name;
        this.localCode = result.local_code;
    }
}

exports.save = (values) => {
    let insertValues = values.map(value => [value.store_code, value.store_name, value.local_code]);
    if(insertValues.length == 0) return;
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'INSERT INTO `credit_union_store`(`store_code`, `store_name`, `local_code`) VALUES ?',
        data = [insertValues],
        (result) => resolve(result),
        (err) => reject(err)
    )
)};

exports.findByIdGte = (id) => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'SELECT ?? FROM `credit_union_store` WHERE `id` >= ? ORDER BY `id` asc',
        data = [columns, id],
        (result) => {
            if(result == undefined || result == null || result.length == 0) resolve(null)
            else resolve(new CreditUnionStore(result[0]))
        },
        (err) => reject(err),
    )
)};