// server, socket, and file reader
var app = require("http").createServer(handler);
var io = require("socket.io")(app);
var fs = require("fs");

// get the port then listen
var PORT = process.env.PORT || process.env.NODE_PORT || 3000;
app.listen(PORT);

// Drawing array
var draws = {};

function handler(req, res)
{
	fs.readFile(__dirname + "/../client/index.html", function(err, data)
	{
		if(err)
		{
			throw err;
		}
		
		res.writeHead(200);
		res.end(data);
	});
}

// Conenction 
io.on("connection", function(socket)
{
	// join the room then do init
	socket.join("room1");	
	socket.on("init", function(data)
	{
		draws[data.frame] = data.data;
		var message = 
		{
			message: "",
			data: draws
		};
		// update all 
		io.sockets.in("room1").emit("updateSquares", message);
	});
	
	// update the data
	socket.on("updatePos", function(data)
	{
		if(draws[data.frame].time < data.time)
		{
			draws[data.frame] = data.data;			
			var message = 
			{
				message: "",
				data: draws
			};
		
			io.sockets.in("room1").emit("updateSquares", message);
		}
	});
	
	// When leaving
	socket.on("leaving", function(data)
	{
		delete draws[data.frame];
		
		var message = 
		{
			message: "",
			data: draws
		};
		
		io.sockets.in("room1").emit("updateSquares", message);
	});
	
	// leave room on disconnect
	socket.on("disconnect", function(data)
	{
		socket.leave("room1");
	});
});

console.log("Listening on port "+PORT);