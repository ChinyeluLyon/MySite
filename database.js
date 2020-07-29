const mysql = require('mysql');

// POOLING
const pool = mysql.createPool({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
})

function useMysqlPool(query, callback){
	pool.getConnection((err,connection)=>{
		if(err) {
			throw err
		}
		// console.log('connected as id ' + connection.threadId)
		connection.query(query, (err, rows) => {
            	connection.release() // return the connection to pool
            	if(err) {
            		throw err
            	}
            	// console.log('The data from table are: \n', rows)
            	callback(rows)
            })
	})
}

// module.exports = pool
exports.useMysqlPool = useMysqlPool
