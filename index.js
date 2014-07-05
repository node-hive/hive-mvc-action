
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["../lodash","../q"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('lodash'), require('q'));
  } else {
    root.HIVE_MVC_ACTION = factory(root.lodash, root.q);
  }
}(this, function(_, Q) {

return (function(){

    var HIVE_MVC = {};


var DEFAULT_METHODS = {
    validate: function(state, done){
        done();
    },
    input: function(state, done){
        done();
    },
    process: function(state, done){
        done();
    },
    output: function(state, done){
        done();
    }
};

/**
 * An action is a collection of related handlers.
 * "related" is of course subjective but as a rule, all action handlers grouped by an action
 * should as a rule share all or most of the same route.
 *
 * Actions host methods that can be shared between its client handlers; by default they have
 * a "stock" set of passthrough methods for `validate`, `input`, `process`, and `output` which
 * can be overridden at either the action or the handler level.
 * @param methods
 * @constructor
 */
function Action(methods){

    this.methods =  _.defaults(methods, DEFAULT_METHODS);

    this.responses = [];
}

Action.prototype = {

    /**
     * instantiates a handler and adds it ot the list of responses.
     * note at this point there is no insulation against defining multiple handlers
     * with the identical profile or guarantee of results in that case. :D
     *
     * @param route {string} see ActionHandler::constructor
     * @param method {string} see ActionHandler::constructor
     * @param handler {variant} see ActionHandler::constructor
     *
     */
    on: function(route, method, handler){
        this.responses.push(new ActionHandler(this, route, method, handler));
    }

};

HIVE_MVC.Action = Action;
var DEFAULT_RESPONSES = ['validate', 'input', 'process', 'output'];

/**
 * An action handler is a construct that represents the "run script" of a particular route solution.
 *
 * In the HTTP context this means, for a given url, and a given method (post, get, etc.)
 * the chain of this ActionHandler instance
 * will call the named/passthrough methods in turn, as promises.
 *
 * Keep in mind that while an ActionHandler was developed to solve HTTP request/response "problems" it is
 * general enough to solve any sort of problems to which a serial set of method passthroughs are appropriate.
 *
 * @param action{::Action} the action that groups related handlers; in general,
 * most or all of the ActionHandlers belonging to a given Action will have similar or identical routes.
 * @param route {String} the route that this instance answers to
 * @param method {string} one of GET|POST|PUT|DELETE|* (any method).
 * @param chain {variant} see chain for details -- the functions called in series to satisfy the action
 * @constructor
 */
function ActionHandler(action, route, method, chain) {

    this.action = action;
    this.route = route;
    this.method = method;

    this.chain(chain);

}

ActionHandler.prototype = {

    /**
     * Sets the functions to be called serially to resolve the action.
     * @param chainValue {variant} either functions or string keys to the functions available
     * from the actions' methods collection.
     *
     * Each method in the chain (whether it resides in the Action "sandbox" or is passed in as a direct function)
     * should expect the signature `function(state, done, error, progress)` where the second and further properties
     * reflect the callbacks for a Q Promise.
     *
     * The first two, `done` and `error` are ordinarily the only ones you'd care about; standard execution will
     * terminate at `done`, fouled executioin will terminate at `error`.
     *
     * @returns {chain}
     */
    chain: function (chainValue) {

        if (arguments.length) {

            var chain = [];
            if (!chainValue) {
                chain = DEFAULT_RESPONSES;
            } else if (_.isFunction(chainValue) || _.isString(chainValue)) {
                chain.push(chainValue);
            } else if (_.isArray(chainValue)) {
                chain = chainValue;
            } else {
                throw  ('cannot understand handler for ' + route + '(' + method + ')');
            }
            this._chain = _.map(chain, function (fn) {
                if (_.isFunction(fn)) {
                    return fn;
                } else if (this.action.methods[fn]) {
                    return this.action.methods[fn];
                } else {
                    throw ('cannot find handler ' + fn);
                }

            }, this);
        }
        return this.chain;

    },

    /**
     * the core method of the handler -- calls the chain serially, using the Q promise construct.
     * This can
     * @param state {ActionState} In the HTTP context, a formal ActionState instance with a express req /res property,
     * are expected.
     *
     * When an ActionHandler is used to process nonHTTP/general problems, state can be any sort of object(even an array)
     * that can be acted on by the handlers. It can even be a read-only configuration,
     * a string, or absent entirely, depending on the nature of the application.
     *
     * @returns {Promise}
     */
    handle: function (state) {
        return Q.all(_.map(this.chain, function (handler) {
            return Q.Promise(_.bind(handler, this.action, state));
        }, this));
    }

};

HIVE_MVC.ActionHandler = ActionHandler;
function ActionState(req, res) {
    this.req = req;
    this.res = res;
    this._response = null;
}

ActionState.prototype = {

    response: function(string){
        if (arguments.length){
            this._response = string;
        }
        return this._response;
    }

};

HIVE_MVC.ActionState = ActionState;

    return HIVE_MVC;
})();

}));
