var ds = null;
module.exports = (datasource) => { 
    ds = datasource;
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

exports.findLastestNotDone = (batchDate) => {
    let date = batchDate.getFullYear() + "-" + (batchDate.getMonth() + 1) + "-" + batchDate.getDate();
    return new Promise((resolve, reject) => 
        ds.query(
            query = 'SELECT ?? FROM ?? WHERE `batch_date` = ? and `status` != "DONE" order by `type_id` desc limit 1',
            data = [columns, table, date],
            (result) => {
                if(result.length == 0) resolve(null);
                else resolve(new CreditUnionBatchTransaction(result[0]));
            },
            () => reject(),
        )
    )
}