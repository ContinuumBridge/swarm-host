
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var InboundSocket = function() {

}
util.inherits(InboundSocket, EventEmitter);

function CBStream(remote, manager) {
    var self = this,
        ln = this.lstn = {},
        buf = [];

    this.inbound = new InboundSocket();
    this.remote = remote;
    this.manager = manager;
    //this.outbound = util.inherits({}, EventEmitter);

    this.inbound.on('data', function(data) {
        console.log('stream inbound', data);
        try {
            ln.data && ln.data(data);
        } catch (ex) {
            console.error('message processing fails', ex);
            ln.error && ln.error(ex.message);
        }
    });

    /*
     ws.on('open', function () {
     buf.reverse();
     self.buf = null;
     while (buf.length) {
     self.write(buf.pop());
     }
     });
     ws.on('close', function () { ln.close && ln.close(); });
     ws.on('message', function (msg) {
     try {
     ln.data && ln.data(msg);
     } catch (ex) {
     console.error('message processing fails', ex);
     ln.error && ln.error(ex.message);
     }
     });
     ws.on('error', function (msg) { ln.error && ln.error(msg); });
     */
}

module.exports = CBStream;

CBStream.prototype.on = function (evname, fn) {
    console.log('CBStream on ', evname);
    if (evname in this.lstn) {
        throw new Error('not supported');
    }
    this.lstn[evname] = fn;
};

CBStream.prototype.close = function () {
    this.manager.closeStream(this);
};

CBStream.prototype.write = function (data) {

    var self = this;

    console.log('stream outbound', data);

    this.manager.emit('data', {
        destination: self.remote,
        body: {
            swarm: data
        }
    });
};
