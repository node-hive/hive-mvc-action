# Hive-MVC-action

This is a set of classes specifically designed to add waterfall style action resolution to the Express 4.0 router. 
Actions contain a series of methods that are called as promise resolvers for a given router path. Each route path's 
result is defined by a discrete Handler, whose properties define not only the method and route to be handled
but the series of functions with which to handle the route, called the 'chain'. 

A handler's chain can be defined by passing an array of functions, or an array of strings 
(identifying functions referenced in its parent action's methods object), or a mixture of strings and functions.
Each function (referenced or literal) is called in turn unless the error callback is triggered, causing the entire
router to escape out (usually throwing an error, or releasing control to whatever is next in the Express chain. 

The scope and ambition of this module is very specific: allowing for a better distribution of the elements of a route
handler, to better share boilerplate sub-tasks for both consistency and speed of development. All tasks outside this 
scope are delegated to express, or other modules or custom code, as you prefer.

## A note on environment/dependencies

altough express is not an inherent dependency of hive-mvc-action, hive-mvc-action is intended to be used
in concert with express 4.0.x; it is not compatible with earlier versions of express. 

## Example: in use

from the integration tests:

``` javascript
    
    var express = require('express');
    var router = express.Router();
    
    var models = require('./../../models/index'); // a dataspace for hive-model (see)
    
    var hmvc = require('hive-mvc-action');
    
    var action = new hmvc.Action({
    
    // defining a shared link function 
    // note, this function is a resource for defining chains but is not
    // automatically inserted until it is referenced in a handler chain
    
        load_articles: function (state, done, onError) {
        
            var articles = models.get_config('articles');
            articles.all(function (e, data) {
                if (e) {
                    onError(e);
                } else {
                    state.out.articles = data;
                    done();
                }
            });
        }
    });
    
    // defining a single handler;
    // note the handler object is returned from the "on" method
    // so that you can define a render hook in place. 
    
    action.on('get', '/', [
        'load_articles'
    ]).render = function (state) {
        state.res.render('articles/index', state.out);
    }; // handler has handler-specific renderer
    
    action.on('post', '/', [
        function(state, done, onErr){
            
            var articles = models.get_config('articles');
            var title = state.req.param('title');
            var content = state.req.param('content');
            articles.put({title: title, content: content}, 
              function(err, article) {
                 if (err) { onErr(err) } else {
                    state.res.redirect('/articles');
                    state.interrupt = true; 
                    // halts further handling of the handler by hive-mvc-action
                    done();
                 }
               });
        }
    ]);
    action.link(router);
    
    module.exports = router;

```

The above module defines a single action that 

The router returned is an express router; the receiving app is populated as such:
(it is an express app instance) 

``` javascript
    
    var articles = require('./routes/articles/index');
    
    app.use('/articles', articles);

```

Beyond this, the structure of the site is the same as any other Express app, with whatever static 
directories, templating engines, error echoers, etc. that the standard Express 4.0 app defines. 

## Rendering HTML 

There may be times where all handled actions have the same templates; 
in other uses you may want individual handlers to have their own rendering templates. 
To accommodate both paths, An ActionHandler will attempt to render output through one of two systems:

1. **An ActionHandler with a render method*** will execute the render method after executing its chain.
   The render method will be passed the state content as an argument, and the state itself as a second argument.
   It is responsible for passing content to the express' 
   res(ponse). 
2. **An ActionHandler that has a template** will execute its template after executing its chain, 
   and return the result as a response.
   The template (which is a function) will be passed the state.out content as an argument. 
3. **An ActionHandler whose Action has a template** will execute the template after executing its chain, 
   and return the result as a response. The template (which is a function) 
   will be passed the `state.out` content as an argument. 

If none of these situations are true, then the state.out will be returned as a JSON response.

Note that the (optional) templates property of an Action or ActionHandler 
is fed two arguments: the state's `out` object, and the state itself. 
As this is not the normal profile for template/view systems like ejs, 
handlebar and _.template(lodash/underscore) you will want to define your own template functions to adapt to your 
view module of choice, not simply slap that view module onto the template property. 
