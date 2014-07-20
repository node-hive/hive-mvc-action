
## Customization

Hive-mvc used to be a self-contained framework. Hive-mvc-action takes the core of the hive-mvc framework and attaches it
directly to Express. As such, the areas formerly contained in the framework are now returned to application developers
to work out on their own. 

There is as little defined practices in hive-mvc-action as possible. No mandate is made as to how to handle data,
no view system is imposed, and no specific routing pattern is required. 

This should free up experienced developers to develop whatever systems they choose but might leave others feeling as if
they have more responsibility for developing application patterns than they want. 

Here are a few suggestions as to how to handle the aspects of routing and modelling that are not composed in this module.

### Templating

Note that while there is a built in templating pipeline in Express, you also have the option of directly piping an HTML
block (see Rendering HTML, above) so its worthwhile discussing what a templating system looks like in Hive-mvc-action
and your various options. 

The act of turning javascript/JSON into an HTML string is often treated as something "Magic" requiring a strong, sophisticated
language of its own. There are many of these:

* Handlebars
* EJS (my favorite)
* _.template (underscore/lodash) -- almost perfectly identical to EJS
* jade (my least favorite)
* haml (almost as bad)

However remember, fundamentally they all produce the same artifact: a function that turns its arguments into an HTML string.

You know what else does that? Regex. Or custom code. 

If you can write a function that takes arguments and produces a string, don't feel obligated to adopt any templating system
at all -- you're done. You won't see significant gains in flexibility through a templating engine and aren't likely to see 
huge variations in performance. 

My advice - grab whatever templating system feels easy to understand and use it -- or make your own template functions. 
I often prefer to use `_.template` simply because I'm already loading the lodash module into my code and its one less
thing my code has to `require`. 

Each of the above systems (and probably another dozen) have their advocates and strong and weak points, but from an output,
performance and flexibility point of view they are completely identical. 

I prefer EJS/_.template because it's linguistic foundation is javascript; you don't really have to "learn" some DSL
to use it. But for those for whom a View DSL makes sense, Handlebars is a pretty good choice, as it doesn't encrypt
the HTML itself in a DSL, just the parts of the template where data is injected. 

Also, keep in mind, server side templates are waning in popularity -- all of the templating systems I describe above (plus
Angular, Backbone, Meteor etc.) are ascending, and you should avoid overinvesting in an application style that perfers
heavy server-side templating where possible.

### Routing

Take a look at the way [Ruby defines routes](http://guides.rubyonrails.org/routing.html) The basic pattern is:
<table class="responsive">
<thead>
<tr>
<th>HTTP Verb</th>
<th>Path</th>
<th>Controller#Action</th>
<th>Used for</th>
</tr>
</thead>
<tbody>
<tr>
<td>GET</td>
<td>/photos</td>
<td>photos#index</td>
<td>display a list of all photos</td>
</tr>
<tr>
<td>GET</td>
<td>/photos/new</td>
<td>photos#new</td>
<td>return an HTML form for creating a new photo</td>
</tr>
<tr>
<td>POST</td>
<td>/photos</td>
<td>photos#create</td>
<td>create a new photo</td>
</tr>
<tr>
<td>GET</td>
<td>/photos/:id</td>
<td>photos#show</td>
<td>display a specific photo</td>
</tr>
<tr>
<td>GET</td>
<td>/photos/:id/edit</td>
<td>photos#edit</td>
<td>return an HTML form for editing a photo</td>
</tr>
<tr>
<td>PATCH/PUT</td>
<td>/photos/:id</td>
<td>photos#update</td>
<td>update a specific photo</td>
</tr>
<tr>
<td>DELETE</td>
<td>/photos/:id</td>
<td>photos#destroy</td>
<td>delete a specific photo</td>
</tr>
</tbody>
</table>

This is not the same as REST but it is "somewhat close". 

Note that there are "Pairs" of routes for every route that changes data; one is for the page on which the *form* for the data
should reside, the other is for the action that that form *feeds data into*. The second of the pair is where actual data
changes (creation, revision, deletion) takes place. This assumes the server-heavy multi-page pattern that is somewhat "old school"
but still very stable. Single page apps will want to use a more standard REST pattern for data.
 
The [REST pattern](http://en.wikipedia.org/wiki/Representational_state_transfer)
that is an industry standard for routing data to client side applications or foreign consumers. It is very useful for mobile, 
or situations where you are simply feeding into a non-HTML (Unity, iOS) client the data it needs to execute.

### Models

There are a stunning array of model systems available to developers; at the least you have to choose between SQL and 
NoSQL systems, and it will never be clear that any specific use case demands one or the other because both are extremely
versatile and powerful and in fact can be combined for even more power. 

NoSQL in my opinion is more suitable for heavy JSON based tasks because it is closer to JSON. It can be structured but 
doing so is not as straightforward in some cases as SQL.

SQL is a strongly typed graph system; its strength is that, becuase its graph is not locked into a (series of) actual
heirarchy as is the case with most NoSQL engines, you can more easily manage multiple simultaneous (implied) heirarchies
of data, though in really big data situations you will be responsible for caching the data in performant systems (possibly through NoSQL). 

#### NoSQL

There are about four top tier NoSQL solutions I'd advocate investigating. In no particular order:

* **[Redis](http://redis.io/)** Redis is a pure, REST style repository of strings; you can store JSON, not JSON, Binary, or whatever else you want in it.
  You won't find any schema in Redis (though you can use other systems like JSON Schema in your app to fill that role) but it is
  blazing fast and amazingly flexible.
* **[MongoDB](http://www.mongodb.org/)** Mongo is a backend JSON store with a (little used) binary storage option, strong support for JavaScript scripting, 
  and like Redis, uses memory caching for rapid execution. Its noted for having a healthy ecosystem of multiple redundant
  and/or load bearing servers for high performance, but controversial for, at times, preferring speed over safety.
  While Mongo itself does not have schema, the Node adaptor that is the most popular system for Mongo access, Mongoose, does.
  It has the ability to operate as a REST server, but in practice is, like most DBs, most often proxied through an application 
  layer.
* **[CouchDB](http://couchdb.apache.org/)** While older than Mongo, it is similar and more deeply invested in stability. It has a native schema, 
  is a pure REST system, meaning little or no ORM code is required to access its data; however the user friendliness
  of Mongo is often absent in some of its deeper utilities. 
* **[Neo4J](http://neo4j.com/?gclid=CI2vseWkz78CFZSEfgod8kIAkQ)** while far less popular than the above, Neo4J is a unique
  exception to the rule of NoSQL in that it allows you to create arbitrary and semantic data heirarchies without having to be
  too heavily committed up front in planning what your hierarchy will look like. You may find that being able to define tactical
  relationships between your data elements in Neo4J reflects the way a particular problem needs to be solved. 
  
All of the NoSQL options will give you high performance and be very friendly to JavaScript. Most are available on Heroku, 
though -- fair warning -- in many cases you won't find the free version of NoSQL services to be practical 
for any but the tiniest of experiments.

There are legions of other NoSQL contenders including Cassandra, Hadoop, and others that I simply have no personal use experience with
and in many cases, aren't as well supported on Heroku. 

#### SQL

There are only two serious open source databases I'd advocate. 

* **PostGRES** is one that is emerging as the modern standard for open source development. It is a complete powerful and 
  well documented system with no downsides and is well supported on Heroku. 
  
* **MySQL** is also a strong standard with decades of development and is supported by Oracle. Opinions differ on the virtue
  of this but like PostGRES it is well supported on Heroku. 
  
Both of these solutions are easily capable of supporting any use case that you can think of and will migrate well into a 
professional use case. 

#### Memory Resident and file based data systems

Because running instances of Node persist, you can store data "In Memory", backing it up to a file system as needed; 
you can also use the file system as a database. When developing a file system app, such as a photo catalog or a document
warehouse this is in effect what you are doing, though an other system might be used to store metadata. 

Also transient data like session metadata can be stored in memory, though you won't want to use this tactic in production
once your use becomes significant. `the hive-model` module used in the integration example is a system I developed to
manage "in memory" data, but its certainly not the only way to have this effect.

In memory systems have the advantage of being dead-simple and easy to debug; your data never leaves the scope of your
Node app, and never needs to be translated into and out of Javascript; it is a store of pure JS content. 

A filesystem based data system is useful for handling large chunks of data, and is about as robust as you can hope for.
However keep in mind, you are not using a database at this point, but writing one of your own, and you lose the speed 
you get from the optimizations that true databases give you when it comes to accessing data that can be optimized for 
aggregate response, buffered in memory, and preprocessed for maximum effectiveness. 

