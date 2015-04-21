
module.exports = {
    ping: function() {
        console.log('ping pinged');
        return "pong";
    },
    register: function() {
        console.log('register models');
        return "yes";
    },
    sum: function () {
        var sum = 0;
        for (var key in arguments) {
            sum+=arguments[key];
        }
        return Promise.resolve(sum);
    },
    log: function (num, base) {
        return Promise.resolve(Math.log(num)/Math.log(base));
    }
};