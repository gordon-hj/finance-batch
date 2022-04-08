module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'credit_union_product';
const columns = ['id', 'product_code', 'product_name', 'interest', 'store_code'];
class CreditUnionProduct {
    constructor(result) {
        this.id = result.id;
        this.productCode = result.product_code;
        this.productName = result.product_name;
        this.interest = result.interest;
        this.storeCode = result.store_code;
    }
}

exports.save = (values) => {
    let insertValues = values.map(value => [value.product_code, value.product_name, value.store_code]);
    if(insertValues.length == 0) return;
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'INSERT INTO `credit_union_product`(`product_code`, `product_name`, `store_code`) VALUES ?',
        data = [insertValues],
        (result) => resolve(result),
        (err) => reject(err)
    )
)};

exports.findByIdGte = (id) => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'SELECT ?? FROM `credit_union_product` WHERE `id` >= ? ORDER BY `id` asc',
        data = [columns, id],
        (result) => {
            if(result == undefined || result == null || result.length == 0) resolve(null)
            else resolve(new CreditUnionProduct(result[0]))
        },
        (err) => reject(err),
    )
)};

exports.updateInterestById = (id, interest) => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'UPDATE `credit_union_product` SET `interest` = ? WHERE `id` = ?',
        data = [interest, id],
        (result) => resolve(result),
        (err) => reject(err),
    )
)};