var ds = null;
module.exports = (datasource) => { 
    ds = datasource;
    return this;
};

const table = 'config';
const columns = ['id', 'key', 'value'];
class Config {
    constructor(result) {
        this.id = result.id;
        this.key = result.key;
        this.value = (result.value == "true")? true : false;
    }
}

exports.findByKey = (key) => {
    return new Promise((resolve, reject) => 
        ds.query(
            query = 'SELECT ?? FROM ?? WHERE `key` = ?',
            data = [columns, table, key],
            (result) => resolve(new Config(result[0])),
            () => reject(),
        )
    )
}
