
var _ = require('underscore');

var Host = require('swarm').Host;
var Spec = require('swarm').Spec;
var Model = require('swarm').Model;
var Syncable = require('swarm').Syncable;
var Set = require('swarm').Set;
var Collection = require('swarm').Collection;

module.exports = Host.extend('QueryHost', {

    registerType: function(type, schema) {
        console.log('register type', type, schema);
        if (schema['id']) delete schema['id'];
        var defaults = _.object(_.map(schema, function(attr, key) {
            return [key, attr['default']];
        }));

        console.log('defaults ', defaults );
        //console.log('Syncable.type', Syncable.types);
        var model = Model.extend(type, {
            //defaults: defaults
            defaults: {
                test: {}
            }
        });
        console.log('model ', model );
        var collectionName = type + "Collection";
        console.log('collectionName ', collectionName );
        Set.extend(collectionName, {});
    },

    getCollection: function(type) {

        var collectionName = type + "Collection";
        var collectionSpec = "/" + collectionName + "#" + collectionName.toLowerCase();
        console.log('collectionSpec ', collectionSpec );
        var collection = this.get(collectionSpec);
        console.log('getCollection collection ', collection );
        return collection;
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
});