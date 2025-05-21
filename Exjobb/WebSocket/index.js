const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function main() {

	const db = await open({
		filename: 'chat.db',
		driver: sqlite3.Database
	});

	await db.exec(`
		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			client_offset TEXT UNIQUE,
			content TEXT
		);
  	`);
	const app = express();
	const server = createServer(app);
	const io = new Server(server, {
		connectionStateRecovery: {}
	});

	app.get('/', (req, res) => {
		res.sendFile(join(__dirname, 'index.html'));
	});

	io.on('connection', (socket) => { 
		console.log('a user connected');
		socket.on('disconnect', () => {
			console.log('user disconnected');
		});
		
	});

	//Handle incoming messages. 
	let i = 0;
	io.on('connection', (socket) => {
		//Send back messgae as soon as received.
		socket.on('chat message', (msg) => {
			socket.emit('response', msg);
			console.log('message: ' + msg);
			i++;
			console.log('count: ' + i);
		});
	});

	server.listen(3000, () => {
		console.log('server running at http://localhost:3000');
	})
}
 main();
