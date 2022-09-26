module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'kfcc_store';
const columns = ['id', 'region_id', 'code', 'name', 'telephone', 'address'];
class KfccStore {
    constructor(result) {
        this.id = result.id;
        this.regionId = result.region_id;
        this.code = result.code;
        this.name = result.name;
        this.telephone = result.telephone;
        this.address = result.address;
    }
}

exports.save = (regionId, values, date) => {
    if(values.length <= 0) return new Promise(resolve => { resolve([]) })
    let insertValues = values.map(value => [regionId, value.gmgoCd, value.name, value.telephone, value.addr, date]);
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'INSERT INTO `kfcc_store`(`region_id`, `code`, `name`, `telephone`, `address`, `base_at`) VALUES ?',
        data = [insertValues],
        (result) => resolve(result),
        (err) => reject(err)
    )).then((_) => new Promise((resolve, reject) => 
            this.ds.query(
                query = 'SELECT ?? FROM `kfcc_store` WHERE `base_at` = ? AND `region_id` = ? ORDER BY `id` ASC',
                data = [columns, date, regionId],
                (result) => resolve(result.map(r => new KfccStore(r))),
                (err) => reject(err)
            )
        )
    )
};

exports.findById = (id) => {
    return new Promise((resolve, reject) => 
    this.ds.query(
        query = 'SELECT ?? FROM `kfcc_store` WHERE `id` = ?',
        data = [columns, id],
        (result) => {
            if(result == undefined || result == null || result.length == 0) resolve(null)
            else resolve(new KfccStore(result[0]))
        },
        (err) => reject(err),
    )
)};
