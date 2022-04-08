module.exports = (context) => { 
    this.ds = context.ds;
    return this;
};


const table = 'credit_union_batch_transaction';
const columns = ['id', 'batch_date', 'type', 'type_id', 'status', 'result'];
class CreditUnionBatchTransaction {
    constructor(result) {
        this.id = result.id;
        this.batchDate = result.batch_date;
        this.type = result.type;
        this.typeId = result.type_id;
        this.status = result.status;
        this.result = result.result;
    }
}

exports.findLastestNotDone = (date) => {
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'SELECT ?? FROM `credit_union_batch_transaction` WHERE `batch_date` = ? and `status` != "DONE" order by `type_id` desc limit 1',
            data = [columns, date],
            (result) => {
                if(result.length == 0) resolve(null);
                else resolve(new CreditUnionBatchTransaction(result[0]));
            },
            (err) => reject(err),
        )
    )
}

exports.findById = (id) => {
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'SELECT ?? FROM `credit_union_batch_transaction` WHERE `id` = ?',
            data = [columns, id],
            (result) => resolve(new CreditUnionBatchTransaction(result[0])),
            (err) => reject(err),
        )
    )
}

exports.save = (batchDate, type, typeId, status) => {
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'INSERT INTO `credit_union_batch_transaction`(`batch_date`, `type`, `type_id`, `status`) VALUES (?, ?, ?, ?)',
            data = [batchDate, type, typeId, status],
            (result) => resolve(result.insertId),
            (err) => reject(err),
        )
    )
}

exports.update = (id, status, result) => {
    return new Promise((resolve, reject) => 
        this.ds.query(
            query = 'UPDATE `credit_union_batch_transaction` SET `status` = ?, `result` = ? WHERE `id` = ?',
            data = [status, result, id],
            () => resolve(),
            (err) => reject(err),
        )
    )
}