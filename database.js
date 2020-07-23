const mysql = require('mysql');
// let connection = mysql.createConnection({
// 	host: 'eu-cdbr-west-03.cleardb.net',
// 	user: 'bcc861a75b94d1',
// 	password: '7a2672e3',
// 	database: 'heroku_b301eebc16a43c7'
// })

// connection.connect(function(err) {
// 	console.log('APP CONNECTEDED :D')
// 	if (err) {
// 		throw err
// 		console.log('APP DISCONECTEDED :(')
// 	}
// });



// let connection;

// function handleDisconnect() {
// 	connection = mysql.createConnection({
// 		host: 'eu-cdbr-west-03.cleardb.net',
// 		user: 'bcc861a75b94d1',
// 		password: '7a2672e3',
// 		database: 'heroku_b301eebc16a43c7'
// 	})


// 	connection.connect(function(err) {              
// 		if(err) {      
// 			console.log('in here')                              
// 			console.log('error when connecting to db:', err);
// 			setTimeout(handleDisconnect, 2000); 
// 		}          
// 		else{
// 			console.log('************APP CONNECTEDED :D*******************')
// 		}                           
// 	});                                   
// 	connection.on('error', function(err) {
// 		console.log('OII!! DB ERROR: ', err);
// 		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
// 			console.log('APP DISCONECTEDED :(, attempting reconnect')
// 			handleDisconnect();                         
// 		}else if('ECONNREFUSED'){
// 			console.log('hadling ECONNREFUSED')
// 		}
// 		 else {                                     
// 			throw err;
// 		}
// 	});
// }

// handleDisconnect();




// POOLING
const pool = mysql.createPool({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
})

module.exports = connection;
