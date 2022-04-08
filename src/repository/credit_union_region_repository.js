module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'credit_union_region';
const columns = ['id', 'regional_code', 'regional_name'];
class CreditUnionRegion {
    constructor(result) {
        this.id = result.id;
        this.regionalCode = result.regional_code;
        this.regionalName = result.regional_name;
    }
}

exports.save = (values) => {
        let insertValues = values.map(value => [value.sidoCd, value.sidoNm]);
        return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'INSERT INTO `credit_union_region`(`regional_code`, `regional_name`) VALUES ?',
            data = [insertValues],
            (result) => resolve(result),
            (err) => reject(err)
        )
    )
} 