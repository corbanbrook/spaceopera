require 'rubygems'
require 'em-websocket'
require 'json'

# Simple websocket server using Ruby Event Machine and the em-websocket extention

EventMachine.run do
  @channel = EM::Channel.new
  
  EM::WebSocket.start :host => "127.0.0.1", :port => 8080, :debug => true do |socket|
    socket.onopen do
      # subscribe user to channel and create a socket id
      sid = @channel.subscribe do |message|
        # incoming channel messages send to socket
        socket.send message
      end

      # send sid to client
      socket.send sid

      socket.onclose do
        # unsubscribe from the channel
        @channel.unsubscribe sid
      end

      socket.onmessage do |message|
        # incoming socket messages send to channel
        @channel.push message # this will be json
      end
    end
  end
end
