module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};

const table = 'kfcc_batch_transaction';
const columns = ['id', 'batch_date', 'type', 'type_id', 'status', 'result'];
class KfccBatchTransaction {
    constructor(result) {
        this.id = result.id;
        this.batchDate = result.batch_date;
        this.type = result.type;
        this.typeId = result.type_id;
        this.status = result.status;
        this.result = result.result;
    }
}

exports.findOldestNotDone = (date) => {
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'SELECT ?? FROM `kfcc_batch_transaction` WHERE `batch_date` = ? AND `status` NOT IN ("DONE", "END") ORDER BY `created_at` ASC LIMIT 1',
            data = [columns, date],
            (result) => {
                if(result.length == 0) resolve(null);
                else resolve(new KfccBatchTransaction(result[0]));
            },
            (err) => reject(err),
        )
    )
}

exports.save = (batchDate, type, typeId, status) => {
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'INSERT INTO `kfcc_batch_transaction`(`batch_date`, `type`, `type_id`, `status`) VALUES (?, ?, ?, ?)',
            data = [batchDate, type, typeId, status],
            (result) => resolve(result),
            (err) => reject(err),
        )
    )
}

exports.saveAll = (batchDate, newTransactions, status) => {
    let insertValues = newTransactions.map(value => [batchDate, value.type, value.typeId, status]);
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'INSERT INTO `kfcc_batch_transaction`(`batch_date`, `type`, `type_id`, `status`) VALUES ?',
            data = [insertValues],
            (result) => resolve(result),
            (err) => reject(err),
        )
    )
}

exports.update = (id, status, result) => {
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'UPDATE `kfcc_batch_transaction` SET `status` = ?, `result` = ? WHERE `id` = ?',
            data = [status, result, id],
            () => resolve(),
            (err) => reject(err),
        )
    )
}