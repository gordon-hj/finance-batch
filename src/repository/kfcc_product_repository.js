module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'kfcc_product';
const columns = ['id', 'store_id', 'name', 'period', 'interest_raw', 'interest'];
class KfccProduct {
    constructor(result) {
        this.id = result.id;
        this.storeId = result.store_id;
        this.name = result.name;
        this.period = result.period;
        this.interestRaw = result.interest_raw;
        this.interest = result.interest;
    }
}

exports.save = (storeId, values, date) => {
    let insertValues = values.map(value => [storeId, value.name, value.period, value.interestRaw, value.interest, date]);
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'INSERT INTO `kfcc_product`(`store_id`, `name`, `period`, `interest_raw`, `interest`, `base_at`) VALUES ?',
        data = [insertValues],
        (result) => resolve(result),
        (err) => reject(err)
    )).then((_) => new Promise((resolve, reject) => 
            this.ds.query(
                query = 'SELECT ?? FROM `kfcc_product` WHERE `base_at` = ? AND `store_id` = ? ORDER BY `id` ASC',
                data = [columns, date, storeId],
                (result) => resolve(result.map(r => new KfccProduct(r))),
                (err) => reject(err)
            )
        )
    )
};
