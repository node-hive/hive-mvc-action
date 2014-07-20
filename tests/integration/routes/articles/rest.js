var express = require('express');
var router = express.Router();

var models = require('./../../models/index');

var hmvc = require('./../../../../index');

var action = new hmvc.Action({
    load_articles: function (state, done, onError) {
        console.log('models: %s', require('util').inspect(models));
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

action.on('get', '/', [
    'load_articles'
]);

action.link(router);

module.exports = router;
