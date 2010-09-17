/**************************************************
 *	Imports
 **************************************************/
var sys = require("sys")
  , ws = require('./lib/ws');

/**************************************************
 *	Consts
 **************************************************/
const MAP_WIDTH = 500;
const MAP_HEIGHT = 500;

const MESSAGE_TYPE_GET_MAP_DATA = "get_map_data";
const MESSAGE_TYPE_PLAYER_DISCONNECTED = "player_disconnected";
const MESSAGE_TYPE_PLAYER_CONNECTED = "player_connected";

/**************************************************
 *	Vars
 **************************************************/
var connections = {};
var players = {};
var connection_uuid = 0;
function get_uuid() { connection_uuid = (connection_uuid + 1) % 1000000; return connection_uuid; } //get_uuid

/**************************************************
 *	Vector
 **************************************************/
function Vector()
{
	this.x = 0;
	this.y = 0;
	this.z = 0;
} //Vector

/**************************************************
 *	Player
 **************************************************/
function Player(uuid)
{
	this.uuid = uuid;
	this.position = new Vector();
	this.rotation = new Vector();
} //Player

/**************************************************
 *	message
 **************************************************/
function create_message(type, data)
{
	if (data === undefined)
		data = null;

	var m = {
		type: type,
		data: data
	};

	return "" + JSON.stringify(m);

} //create_message

/**************************************************
 *	Web Socket Server
 **************************************************/
var server = ws.createServer();

server.addListener("listening", function(){
	sys.log("Listening for connections.");
});

// Handle WebSocket Requests
server.addListener("connection", function(conn) {

	// unique identifier for connection
	var uuid = get_uuid();
	var player = new Player(uuid);

	player.position.x = Math.floor(Math.random() * MAP_WIDTH);
	player.position.y = Math.floor(Math.random() * MAP_HEIGHT);

	conn.storage.set("uuid", uuid);
	conn.storage.set("player", player);
	connections[uuid] = conn;
	players[uuid] = player;
	console.log("New connection: " + uuid);

	conn.addListener("message", function(message) {
		obj = JSON.parse(message);
		console.log(obj);

		switch (obj.type)
		{
			case MESSAGE_TYPE_GET_MAP_DATA:
				var map_data = {width: MAP_WIDTH, height: MAP_HEIGHT, players: players};
				var m = create_message(MESSAGE_TYPE_GET_MAP_DATA, map_data);
				console.log(m);
				conn.send(m);
				break;
		} //switch

	}); //message

	server.broadcast(create_message(MESSAGE_TYPE_PLAYER_CONNECTED, player));

}); //connection

server.addListener("close", function(conn){
	server.broadcast(create_message(MESSAGE_TYPE_PLAYER_DISCONNECTED, conn.storage.get("player")));
	var uuid = conn.storage.get("uuid");
	console.log("Closing connection: " + uuid);
	delete players[uuid];
	delete connections[uuid];
});

/**************************************************
 *	Main
 **************************************************/
server.listen(8888);
