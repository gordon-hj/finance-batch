// datasource configuration
const mysql = require('mysql');

module.exports = (phase) => {
    // TODO CONF 로딩 방식 예쁘게 만들기
    var conf = require('../conf/conf')(phase).datasource;
    this.pool = mysql.createPool({
        connectionLimit: conf.connectionLimit,
        host: conf.host,
        user: conf.user,
        password: conf.password,
        database: conf.database,
        debug: conf.debug,
    });
    console.log("Mysql Datasource connected => host : " + conf.host + ", user : " + conf.user + ", database : " + conf.database);
    return this;
}

exports.query = (query, data, success, fail) => {
    this.pool.getConnection((err, conn) => {
        if(err) {
            if(conn) conn.release();
            queryError(query, data, err);
            fail();
            return;
        }
        conn.query(query, data, (err, result) => {
            conn.release();
            if(err) {
                queryError(query, data, err);
                fail(err);
                return;
            }
            success(result);
            return;
        });
    })
}

queryError = (query, data, err) => {
    console.log("Query failed => query: " + query + ', data: ' + JSON.stringify(data));
    console.log(err);
}