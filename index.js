
var repl = require('repl');
var _ = require('underscore');
var RPC = require('./rpc/server');
swarmHost = require('./swarm/swarm').host;
var StreamManager = require('./streams/manager');

var Switch = require('./models/switch');

CB = require('continuumbridge');
logger = CB.logger;

client = new CB.Client({
    /*
    key: '255a3f81gPVwTy2qHcRrJHQ+yLnYvEFdOvNq3cKGVXNa80WEVRzdbsyaf+RT7dJV',
    cbAPI: 'http://dev.continuumbridge.com:8000/api/bridge/v1/',
    cbSocket: 'http://dev.continuumbridge.com',
    bridge: true
    */
    key: '33d347b7Cq1RBN9mtkyGk6ovD9nf/FmZsBsMi4VPWvUmP8Z/ksqoxW0FWJbObwG8',
    cbAPI: 'http://dev.continuumbridge.com:8000/api/client/v1/',
    cbSocket: 'http://dev.continuumbridge.com'
});

var streamManager = new StreamManager(client, swarmHost);

Spec = require('swarm').Spec;
var rpc = new RPC(swarmHost);
swarmHost.app = rpc;
rpc.listen('/var/tmp/swarm_socket');

client.on('message', function(message) {
    streamManager.deliver(message);
});

client.on('connect', function() {
    logger.log('Client connected');
});

repl.start({
    prompt: "node via stdin> ",
    input: process.stdin,
    output: process.stdout,
    useGlobal: true
});

/*
var genericSwitch = new Switch('1');

genericSwitch.on('.init', function() {
    if (this._version!=='!0') {
        console.log('genericSwitch init return', this._version);
        return; // FIXME default values
    }
    genericSwitch.set({
        value: false,
        symbol: '1'
    });
});
*/
 /*
    var testMessage = new CB.Message({
        body:
        {
            status: 'Bridge state: stopped'
        },
        source: 'CID46',
        destination: 'UID1/BID2/AID9',
        time_sent: '2014-08-23T00:56:41.913Z'
    });
    //setTimeout(client.publish(testMessage), 2000);
    setTimeout(client.publish({
        source: 'CID46',
        destination: 'UID1/BID2/AID9',
        body: {
            test: 'Test json message'
        }
    }), 2000);
    */