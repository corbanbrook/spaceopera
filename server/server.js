var ws = require("./ws");

// Websocket TCP server
ws.createServer(function (websocket)
{
	clients.push(websocket);

	websocket.addListener("connect", function (resource)
	{
		// emitted after handshake
		sys.debug("connect: " + resource);
	}).addListener("close", function ()
		{
			// emitted when server or client closes connection
			clients.remove(websocket);
			sys.debug("close");
		});
}).listen(8888);
