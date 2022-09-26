module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'kfcc_region';
const columns = ['id', 'region_name', 'local_name', 'base_at'];
class KfccRegion {
    constructor(result) {
        this.id = result.id;
        this.regionName = result.region_name;
        this.localName = result.local_name;
    }
}

exports.save = (values, date) => {
    if(values.length <= 0) return new Promise(resolve => { resolve([]) })
    let insertValues = values.map(value => [value.regionName, value.localName, date]);
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'INSERT INTO `kfcc_region`(`region_name`, `local_name`, `base_at`) VALUES ?',
        data = [insertValues],
        (result) => resolve(result),
        (err) => reject(err)
    )).then((_) => new Promise((resolve, reject) => 
            this.ds.query(
                query = 'SELECT ?? FROM `kfcc_region` WHERE `base_at` = ? ORDER BY `id` ASC',
                data = [columns, date],
                (result) => resolve(result.map(r => new KfccRegion(r))),
                (err) => reject(err)
            )
        )
    )
};

exports.findById = (id) => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'SELECT ?? FROM `kfcc_region` WHERE `id` = ?',
        data = [columns, id],
        (result) => {
            if(result == undefined || result == null || result.length == 0) resolve(null)
            else resolve(new KfccRegion(result[0]))
        },
        (err) => reject(err),
    )
)};
