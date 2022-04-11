module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'credit_union_local';
const columns = ['id', 'local_code', 'local_name', 'regional_code'];
class CreditUnionLocal {
    constructor(result) {
        this.id = result.id;
        this.localCode = result.local_code;
        this.localName = result.local_name;
        this.regionCode = result.regional_code;
    }
}

exports.save = (values, date) => {
    let insertValues = values.map(value => [value.local_code, value.local_name, value.region_code, date]);
    if(insertValues.length == 0) return;
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'INSERT INTO `credit_union_local`(`local_code`, `local_name`, `regional_code`, `base_at`) VALUES ?',
        data = [insertValues],
        (result) => resolve(result),
        (err) => reject(err)
    )
)};

exports.findByIdGte = (id, date) => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'SELECT ?? FROM `credit_union_local` WHERE `id` >= ? and `base_at` = ? ORDER BY `id` asc',
        data = [columns, id, date],
        (result) => {
            if(result == undefined || result == null || result.length == 0) resolve(null)
            else resolve(new CreditUnionLocal(result[0]))
        },
        (err) => reject(err),
    )
)};