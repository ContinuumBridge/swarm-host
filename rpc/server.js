"use strict";

var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var rpc = require('jrpc2');
var netstring = require('netstring');
var net = require('net');

var Spec = require('swarm').Spec;
var Syncable = require('swarm').Syncable;

var RPC = function(swarmHost) {

    var self = this;

    var server = this.server = new rpc.server();
    var host = this.host = swarmHost;
    var clients = this.clients = [];

    //server.loadModules(__dirname + '/modules/', function () {});

    server.exposeModule('swarm', {
        ping: function() {
            console.log('ping pinged');
            return "pong";
        },
        registerSchema: function(type, schema) {
            host.registerSchema(type, schema);
            return "yes Schema";
        },
        subscribeModel: function(type, attributes) {
            return host.subscribeModel(type, attributes);
        },
        updateModel: function(type, attributes) {
            return host.updateModel(type, attributes);
        },
        onTraitChange: function(type, attributes) {
            return host.onTraitChange(type, attributes);
        },
        get: function(type, attributes, options) {

            var id = "#" + attributes['id'] || "";
            var spec = util.format('/%s%s', type, id);
            console.log('spec ', spec );
            var model = host.get(spec);
            console.log('get model', model.toPojo());
            return model.toPojo();
        },
        query: function(method, type, parameters) {
            if (!host[method]) return new Error("Query method not understood");
            return host[method](type, parameters);
        },
        subscribe: function(spec) {
            var model = host.get(spec);
            model.on(function() {

            });
        }
    });
}

RPC.prototype.listen = function(socketPath) {

    var self = this;

    var rpcSocketPath = socketPath + "_rpc";
    console.log('rpcSocketPath ', rpcSocketPath );
    fs.unlink(rpcSocketPath, function () {
        // This server listens on a Unix socket at /var/run/mysocket
        var unixServer = net.createServer(function (client) {

            client.on('data', function (buffer) {
                //client.end();
                var dataString = buffer.toString();
                var dataJSON = dataString.slice(0, -1).split(/:(.+)?/)[1];
                var data = JSON.parse(dataJSON);

                console.log('received', data);
                if (_.property('jsonrpc')(data)) {
                    var req = {};
                    self.server.handleRequest(data, req, function(answer) {
                        var buffer = netstring.nsWrite(JSON.stringify(answer));
                        if (answer) client.write(buffer);
                    });
                } else {
                    console.log('received data', data);
                }
            });

            client.on('error', function(error) {
                console.log('error', error);
            });
            client.on('close', function(error) {
                if (error) {
                    console.log('close error', error);
                }
            });
        });
        unixServer.listen(rpcSocketPath);
    });

    fs.unlink(socketPath, function () {
        // This server listens on a Unix socket at /var/run/mysocket
        var unixServer = net.createServer(function (client) {

            //console.log('new client', client);
            self.clients.push(client);

            client.on('data', function (buffer) {
                //client.end();
                var dataString = buffer.toString();
                console.log('received data', dataString);
                /*
                var dataJSON = dataString.slice(0, -1).split(/:(.+)?/)[1];
                var data = JSON.parse(dataJSON);
                */

            });

            client.on('close', function(error) {
                if (error) {
                    console.log('close error', error);
                }
                var clients = self.clients;
                clients.splice(clients.indexOf(client), 1);
            });
        });
        unixServer.listen(socketPath);
    });

}

RPC.prototype.write = function(message) {

    console.log('write message', message);
    var buffer = netstring.nsWrite(JSON.stringify(message));
    if (buffer) {
        _.each(this.clients, function(client) {
            client.write(buffer);
        });
    }
};

module.exports = RPC;

/*
rpcServer.loadModules(__dirname + '/modules/', function () {
});
*/




/*
process.on('SIGTERM', function () {
    unixServer.close(function () {
        process.exit(0);
    });
});
*/
