# Hive-MVC-action

This refactoring of the action-resolution component of hive-mvc is intended to make atomic the action-handling 
mechanic of hive-mvc. This includes making it independent of hive-mvc, Express and even Node.js itself. 

Action handling is a specialization of asynchronous problem solving, optimized for http request response handling
via Express.js. 

The Hive-mvc-action module is intended to minimize callback spaghetti by turning each response into a "micro-application"
whose handlers cascade. This is done internally via promises but the footprint from the design aspect is a simple
set of functions with done and error callbacks, including a state object for each request (or other sort of problem). 

State includes the req/res objects from express as well as (to come) some useful hooks for access to request parameters. 

The function of the ActionHandler methods is to add output data to the state (specifically to state.out by default). 
The output of Action.handle(handler, req, res) is the promise to be executed asynchronously, and that includes 
the state (as a $state property) which the handler will modify.

## Rendering HTML 

Actions with a template function will inject a combination of that function and the `state.out` content -- unless
the ActionHandler itself has a `render` method that will supercede it, in which case the handler is responsible for 
the response. 

If there is a template in either of these instances, it is assumed that the state has an Express `res`(ponse) object
and will invoke `state.res.send(action.template(state.out, state))` (or in the case of renderable ActionHandler instances,
`handler.render(state)`). 

## Rendering JSON

Actions that have no templates, for ActionHandlers without render methods, will respond the state's `.out` property as 
a JSON; this will be the default path for Actions that have not been actively assigned templates, and whose ActionHandler's
don't have responses -- this is the default condition. This is done via the `state.res.json(state.out)` 
hook in `Action.render`.

## "Other" / error

If state.next is set to true, then the end of the promise will pass control back to express. While most of the functionality
of a standard app should terminate within the scope of the action, if for some reason continuing down the Express handler
chain is desired, simply set state to next; the state object will be thrown out, but Express will have access to the req/res
values changed during the actions' execution.

Also, any error result during handler execution will pass the thrown error to next. (that is, errors passed through the 
error callback of an ActionHandler method -- no guarantee is made of what a standard error throw will do to your application.)

## using notify to debug actions

The fourth handler callback, `notify` is not part of a running apps' flow but can be used for tracking how far an 
action has got before it fails. see [the Q documentation[(https://github.com/kriskowal/q#using-qpromise) for context
on how notify works in the promise context. 


## Customization

This leaves a significant swath for customization. Any headers, etc. 