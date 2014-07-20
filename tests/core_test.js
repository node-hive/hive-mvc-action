var _ = require('lodash');
var hive_mvc_action = require('./../index');
var should = require('should');

describe('reflection', function(){

    it('should have core classes', function(){
       (typeof hive_mvc_action.Action).toString().should.eql('function');
        (typeof hive_mvc_action.ActionState).toString().should.eql('function');
        (typeof hive_mvc_action.ActionHandler).toString().should.eql('function');
    });

});