"use strict";
const gulp        = require('gulp'),
      _           = require('lodash'), // https://www.npmjs.com/package/lodash
      del         = require('del'), // https://www.npmjs.com/package/del
      fs          = require('fs'), // Node file system
      gutil       = require('gulp-util'), // https://www.npmjs.com/package/gulp-util
      htmlReplace = require('gulp-html-replace'), // https://www.npmjs.com/package/gulp-html-replace
      notify      = require("gulp-notify"), // https://www.npmjs.com/package/gulp-notify
      runSequence = require('run-sequence'), // https://www.npmjs.com/package/run-sequence
      sass        = require('gulp-ruby-sass'), // https://www.npmjs.com/package/gulp-ruby-sass
      sourcemaps  = require('gulp-sourcemaps'); // https://www.npmjs.com/package/gulp-sourcemaps

const rootPath = process.cwd();

const paths = {
    files: ['src/static/**']
};

const errorlog = err => {
    gutil.log(gutil.colors.red.bold.inverse('  ERROR: '+err));
    this.emit('end');
};

const logFileChanged = path => {
    process.stdout.write(gutil.colors.red(' →→→→→→→→→→→→→→→→→   ' +path+ '\n'));
};

// Build tasks chain ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
gulp.task('build', function(cb) {
    runSequence(
        'build-app-css',      // Minify and concat app styles
        'build:move-files',
        'build:index',        // Replace scripts in index.html
        'build:final', cb);   // Remove app.min.js from build folder
});

gulp.task('build:move-files', () => gulp.src(paths.files).pipe(gulp.dest('starfeeder/')) );

// Preprocess SASS into CSS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build-app-css', () => sass('src/sass/starfeeder.scss', { style: 'compressed' }).on('error', errorlog).pipe(gulp.dest('src/static/css/')) );

// Clear out all files and folders from build folder \\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:cleanfolder', cb => { del(['starfeeder/**'], cb); });

// Task to make the index file production ready \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:index', () => {
    process.stdout.write(gutil.colors.white.inverse(' New asset paths in markup: \n'));
    process.stdout.write(gutil.colors.yellow(' static/css/starfeeder.css\n'));
    
    gulp.src('index.html')
        .pipe(htmlReplace({
            'app-css': 'css/starfeeder.css',
            'app-logo': '<img src="imgs/starfeeder.png" title="Starfeeder" alt="Starfeeder"/>'
        }))
        .pipe(gulp.dest('starfeeder/'))
        .pipe(notify('Starfeeder build created!'));
});

gulp.task('build:final', cb => {
    process.stdout.write(gutil.colors.blue.bold   ('######################################################     \n'));
    process.stdout.write(gutil.colors.blue.inverse('               Starfeeder build created!                   \n'));
    process.stdout.write(gutil.colors.blue.bold   ('######################################################     \n'));
});

// Main Styles /////////////////////////////////////////////////////////////////
gulp.task('app-css', () => {
    return sass('src/sass/starfeeder.scss', { style: 'compressed' })
    .pipe(sourcemaps.init())
    .on('error', errorlog)
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('src/static/css/'));
});

// Development watch /////////////////////////////////////////////////////////// 🤖☕️⏎→
gulp.task('watch', () => {
    gulp.watch('src/sass/**/*.scss', ['app-css']).on('change', file => {
        let filePath = file.path.split(rootPath);
        logFileChanged(filePath[1]);
    });
});

gulp.task('default', ['watch']);