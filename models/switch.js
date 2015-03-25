"use strict";

var Model = require('swarm').Model;

// Our key class: a mouse pointer :)
module.exports = Model.extend('Switch', {
    defaults: {
        name: '',
        value: 'off'
    },

    toggle: function () {
        var value = this.value == "on" ? "off" : "on";
        this.set({ value: value });
    }
});