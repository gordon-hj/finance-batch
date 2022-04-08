var ds = null;
module.exports = (datasource) => { 
    ds = datasource;
    return this;
};

const table = 'config';
const columns = ['id', 'key', 'value'];
class Config {
    constructor(id, key, value) {
        this.id = id;
        this.key = key;
        this.value = (value == 'true')? true : false;
    }
}

exports.findByKey = (key) => {
    return new Promise((resolve, reject) => 
        ds.query(
            query = 'SELECT ?? FROM ?? WHERE `key` = ?',
            data = [columns, table, key],
            (result) => resolve(parseRows(result)[0]),
            () => reject(),
        )
    )
}

parseRows = (result) => {
    return result.map((v) => {
        return new Config(v.id, v.key, v.value);
    });
}