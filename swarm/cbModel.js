
var Model = require('swarm').Model;


module.exports = Model.extend('CBModel', {

    getType: function() {
        return this.constructor._pt._type;
    },

    toJSON: function() {
        var data = this.toPojo();
        data['id'] = this._id;
        return data;
    }
});
