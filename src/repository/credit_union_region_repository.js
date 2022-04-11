module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'credit_union_region';
const columns = ['id', 'regional_code', 'regional_name', 'base_at'];
class CreditUnionRegion {
    constructor(result) {
        this.id = result.id;
        this.regionalCode = result.regional_code;
        this.regionalName = result.regional_name;
    }
}

exports.save = (values, date) => {
    let insertValues = values.map(value => [value.sidoCd, value.sidoNm, date]);
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'INSERT INTO `credit_union_region`(`regional_code`, `regional_name`, `base_at`) VALUES ?',
        data = [insertValues],
        (result) => resolve(result),
        (err) => reject(err)
    )
)};

exports.deleteAll = () => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'DELETE FROM `credit_union_region`',
        data = [],
        (result) => resolve(result),
        (err) => reject(err)
    )
)};

exports.findByIdGte = (id, date) => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'SELECT ?? FROM `credit_union_region` WHERE `id` >= ? and `base_at` = ? ORDER BY `id` asc',
        data = [columns, id, date],
        (result) => {
            if(result == undefined || result == null || result.length == 0) resolve(null)
            else resolve(new CreditUnionRegion(result[0]))
        },
        (err) => reject(err),
    )
)};