// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	compass =  require('gulp-compass'),
	browserify = require('gulp-browserify'),
	gutil = require('gulp-util'),
	browserSync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	plumber = require('gulp-plumber');

gulp.task('html', function() {
 	gulp.src('Development/html/*.html')
    .pipe(fileinclude('@@'))
    .pipe(gulp.dest('Production/'))
});

// Compile Our Sass with Compass
gulp.task('sass', function() {
    return gulp.src('Development/scss/compile/*.scss')
        .pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
    	}}))
        .pipe(compass({
	        'sass': 'Development/scss/compile',
	        'css': 'Production/css',
	        'images': 'Production/images',
	        'style': 'compressed'
        }))
        .on('error', function(err) {})
        .pipe(gulp.dest('Production/css'));
});

gulp.task('css', ['sass'], function () {
    del(['Production/css/**/*', '!Production/css/main.css']);
});

// JS PLUGINS - concat and min
gulp.task('js', function() {
    return gulp.src('Development/scripts/*.js')
        .pipe(concat('app.min.js'))
        .pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest('Production/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('Development/scripts/**/*', ['js']);
    gulp.watch('Development/scss/**/*', ['sass']);
    gulp.watch('Development/html/**/*', ['html']);
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
gulp.task('default', ['html', 'sass', 'js', 'watch', 'sync']);