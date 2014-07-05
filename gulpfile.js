var concat = require('gulp-concat');
var wrap = require('gulp-wrap-umd');
var gulp = require('gulp');

var o = [
    {name: 'lodash', globalName: 'lodash', amdName: '../lodash', paramName: '_'},
    {name: 'q', globalName: 'q', amdName: '../q', paramName: 'Q'}
];

gulp.task('scripts', function() {
    gulp.src(['./lib/frame/head.js', './lib/*.js', './lib/frame/foot.js'])
        .pipe(concat('index.js'))
        .pipe(wrap({namespace: 'HIVE_MVC_ACTION', deps: o}))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['scripts']);