'use strict';

let gulp = require('gulp');
let gulpif = require('gulp-if');
let clean = require('gulp-clean');
let useref = require('gulp-useref');
let sequence = require('gulp-sequence');
let cleanCSS = require('gulp-clean-css');
let closureCompiler = require('google-closure-compiler').gulp();

gulp.task('clean', () => {
    return gulp.src([
            './dist',
            './temp'
        ], {
            read: false
        })
        .pipe(clean());
});

gulp.task('combine', () => {
    return gulp.src('./src/*.html')
        .pipe(useref())
        .pipe(gulp.dest('./temp/'));
});

gulp.task('css', () => {
    return gulp.src('./temp/styles')
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./dist/'));
})

gulp.task('js', () => {
    return gulp.src('./src/scripts/*.js')
        .pipe(closureCompiler({
            compilation_level: 'ADVANCED',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT_NEXT',
            language_out: 'ECMASCRIPT5_STRICT',
            js_output_file: 'main.js'
        }))
        .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('build', sequence('combine', 'css', 'js'));

gulp.task('watch', () => {
    gulp.watch('./src/**/*.*', () => {
        sequence('clean', 'build');
    });
});

gulp.task('default', sequence('clean', 'watch', 'build'));


// gulp.task('css', function() {
//   return gulp.src('.src/styles/*.css')
//     .pipe(cleanCSS({ compatibility: 'ie8' }))
//     .pipe(gulp.dest('./dist/styles/'));
// });