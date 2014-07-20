var hm = require('hive-model');

module.exports = function (ds) {

    hm.Model(
        {
            data: [
                {id: 1, name: 'Alpha Article', content: 'alpha beta gamma rodan'},
                {id: 1, name: 'Shopping List', content: 'milk beets bread beef'}
            ]
        , name: 'articles'},
        {},
        ds
    );

};