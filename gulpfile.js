// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	gutil = require('gulp-util'),
	browserSync = require('browser-sync').create(),
	del = require('del'),
	plumber = require('gulp-plumber'),
	less = require('gulp-less'),
	minifyCss = require('gulp-minify-css');

// Compile Our Sass with Compass
gulp.task('less', function() {
    return gulp.src('Development/less/compile/*.less')
        .pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
    	}}))
    	.pipe(less())
    	.on('error', function(err) {})
    	//.pipe(minifyCss())
    	.pipe(gulp.dest('Production/css'));
});

// JS PLUGINS - concat and min
gulp.task('js', function() {
    return gulp.src('Development/scripts/*.js')
    	.pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
    	}}))
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('Production/js'));
});

// JS PLUGINS - concat and min
gulp.task('plugins', function() {
    return gulp.src('Development/requirements/*.js')
    	.pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
    	}}))
        .pipe(concat('plugins.min.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('Production/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('Development/scripts/**/*', ['js']);
    gulp.watch('Development/requirements/**/*', ['plugins']);
    gulp.watch('Development/less/**/*', ['less']);
    gulp.watch(['Production/**/*']).on('change', browserSync.reload);
});

// BROWSER SYNC
gulp.task('sync', function() {
    browserSync.init({
        server: {
            baseDir: "Production/"
        }
    });
});

// Default Task
gulp.task('default', ['less', 'js', 'plugins', 'watch', 'sync']);