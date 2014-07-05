var _ = require('lodash');
var hive_mvc_action = require('./../index');
var should = require('should');

describe('ActionHandler', function () {

    describe('basic default response', function () {

        var actionHandler;
        var mockState;
        before(function () {
            var mockAction = {
                methods: {
                    validate: function (s, d, e) {
                        d();
                    },
                    input: function (s, d, e) {
                        d();
                    },
                    process: function (s, d, e) {
                        d();
                    },
                    output: function (s, d, e) {
                        s.out.foo = 'bar';
                        d();
                    }
                }
            };
            mockState = {out: {}};
            actionHandler = new hive_mvc_action.ActionHandler(mockAction, '/', 'get', null); // default/empty action
        });

        it('should handle a request', function (done) {
            actionHandler.handle(mockState).then(function () {
                mockState.out.foo.should.eql('bar');
                done();
            });
        });
    })

    describe('custom path', function () {

        var actionHandler;
        var mockState;
        before(function () {
            var mockAction = {
                methods: {
                    validate: function (s, d, e) {
                        d();
                    },
                    input: function (s, d, e) {
                        d();
                    },
                    process: function (s, d, e) {
                        d();
                    },
                    output: function (s, d, e) {
                        delete s.out; // sabotage out mechanic
                        // this output should never be reached.
                        d();
                    },
                    a: function (s, d, e) {
                        d();
                    },
                    b: function (s, d, e) {
                        d();
                    },
                    c: function (s, d, e) {
                        s.out.foo = 'vey';
                        d();
                    }
                }
            };
            mockState = {out: {}};
            actionHandler = new hive_mvc_action.ActionHandler(mockAction, '/', 'get', ['a', 'b', 'c']); // default/empty action
        });

        it('should handle a request', function (done) {
            actionHandler.handle(mockState).then(function () {
                mockState.out.foo.should.eql('vey');
                done();
            });
        });
    })
});