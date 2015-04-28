
var _ = require('underscore');
var Q = require('q');

var Host = require('swarm').Host;
var Spec = require('swarm').Spec;
//var Model = require('swarm').Model;
var CBModel = require('./cbModel');
var Syncable = require('swarm').Syncable;
var Set = require('swarm').Set;
var Collection = require('swarm').Collection;

module.exports = Host.extend('QueryHost', {

    registerSchema: function(type, schema) {
        console.log('registerSchema', type, schema);
        if (schema['id']) delete schema['id'];

        CBModel.extend(type, {
            defaults: schema
        });
        var storeName = type + "Store";
        Set.extend(storeName, {});
    },

    getModel: function(type, id) {
        var modelID = "/" + type + "#" + id;
        return this.get(modelID);
    },

    getStore: function(type) {

        console.log('storeID type', type);
        var storeID = "/" + type + "Store#" + type.toLowerCase() + "store";
        console.log('storeID ', storeID );
        return this.get(storeID);
    },

    subscribeModel: function(name, attributes) {

        console.log('subscribeModel', name, attributes);
        var self = this;

        var attrs = _.omit(attributes, 'id');
        var type = Syncable.types[name];
        if (!type) return "Model type unrecognised";
        var model = new type();
        model.set(attrs);

        var store = this.getStore(name);
        store.addObject(model);

        var deferred = Q.defer();
        model.on('.init', function() {
            console.log('init model.toJSON', model.toJSON());
            deferred.resolve(model.toJSON());
        });
        model.on(function() {
            var message = {
                type: model.getType(),
                data: model.toJSON()
            }
            console.log('model on message', message);
            self.app.write(message);
        });
        //return "all OK";
        return deferred.promise;
    },

    onTraitChange: function(type, attributes) {
        var model = this.getModel(type, attributes['id']);
        var attrs = _.omit(attributes, 'id');
        model.set(attrs);
        return "onTraitChange";
    },

    all: function(type) {

        //var models = collection.list();
        var collection = this.getCollection(type);
        var models = _.map(collection.list(), function(model) {
            return model.toPojo();
        });
        console.log('all models', models);

        /*
        var matched = [];
        _.each(this.objects, function(value, key) {
            console.log('key in all ', key);
            if(type == Spec.prototype.get.call({value: key}, '/')) {
                matched.push(this.objects[key].toPojo());
            }
        });
        return matched;
        console.log('matched');
        */
    }

    /*
    getCollection: function(type) {

        var collectionName = type + "Collection";
        var collectionSpec = "/" + collectionName + "#" + collectionName.toLowerCase();
        console.log('collectionSpec ', collectionSpec );
        var collection = this.get(collectionSpec);
        console.log('getCollection collection ', collection );
        return collection;
    },
    */
});