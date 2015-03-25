
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var CBStream = require('./stream');

var StreamManager = function(cbClient, swarmHost) {

    var self = this;

    this.client = cbClient;
    this.host = swarmHost;

    this.streams = {};

    this.on('data', function(message) {
        console.log('manager emit data cbid', self.client.cbid);
        message.source = self.client.cbid;
        self.client.publish(message);
    });
}

util.inherits(StreamManager, EventEmitter);

StreamManager.prototype.deliver = function(message) {

    var self = this;

    var msg = message.toJSON();

    console.log('streamManager deliver message', message);
    var body = _.property('body')(msg);
    if (!body) return;

    console.log('streamManager deliver body', body);
    var remote = _.property('source')(msg);
    if (remote == 'cb') return;

    // Get or create a stream
    var stream;
    stream = this.streams[remote];
    if (!stream) {
        console.log('creating new stream, remote', remote);
        stream = this.streams[remote] = new CBStream(remote, this);
        this.host.accept(stream, { delay: 50 });
        /*
        stream.on('close', function(stream) {
            console.log('removing stream from manager');
            delete self.streams[stream.remote];
        });
        */
    }

    var swarmData = _.property('swarm')(body);
    //console.log('streamManager deliver swarmData', swarmData);
    if (swarmData) {
        stream.inbound.emit('data', swarmData);
    } else {
        // It's not a swarm message
    }
}

StreamManager.prototype.closeStream = function(stream) {

    delete this.streams[stream.remote];
}

module.exports = StreamManager;