var DEFAULT_METHODS = {
    validate: function (state, done) {
        done();
    },
    input: function (state, done) {
        done();
    },
    process: function (state, done) {
        done();
    },
    output: function (state, done) {
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
function Action(methods) {

    this.methods = _.defaults(methods, DEFAULT_METHODS);

    this.handlers = [];
}

Action.prototype = {

    /**
     * instantiates a handler and adds it ot the list of responses.
     * note at this point there is no insulation against defining multiple handlers
     * with the identical profile or guarantee of results in that case. :D
     *
     * @param route {string} see ActionHandler::constructor
     * @param method {string} see ActionHandler::constructor
     * @param handlerConfig {variant} see ActionHandler::constructor
     *
     */
    on: function (method, route, handlerConfig) {
        var handler = new ActionHandler(this, method, route, handlerConfig);
        this.handlers.push(handler);
        return handler;
    },

    /**
     * Binds each handler in the Actions' handlers to an app.
     * By default an app is an Express Application;
     * however any class that provides "ducktype" handlers for REST methods and the `use` method
     * and can provide the req/res objects to the "handle" method of Action should work.
     *
     * @param router {express.router}
     */
    link: function (router) {
        _.each(this.handlers, function (ah) {
            if (ah.method == '*') {
                router.use(ah.route, _.bind(this.handle, this, ah));
            } else if (_.isFunction(router[ah.method.toLowerCase()])) {
                router[ah.method.toLowerCase()](ah.route, _.bind(this.handle, this, ah));
            } else {
                throw 'Router cannot handle method ' + ah.method;
            }
        }, this);
    },

    handle: function (handler, req, res, next) {
        var state = new ActionState(req, res, this);
        var promise = handler.handle(state); // returns a promise
        promise.$state = state;
        promise.then(function () {
            if (!state.interrupt){
                this.render(handler, state, next);
            }
        }.bind(this), next);
        return promise;
    },

    render: function (handler, state, next) {
        if (state.next) {
            next();
        } else if (handler.render) {
            handler.render(state);
        } else if (handler.template){
            state.res.send(handler.template(state.out, state));
        } else if (this.template) {
            state.res.send(this.template(state.out, state));
        } else {
            state.res.json(state.out);
        }

    }

};

HIVE_MVC.Action = Action;