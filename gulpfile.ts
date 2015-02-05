/// <reference path="./typings/tsd.d.ts" />

'use strict';

// load gulp
var gulp = require('gulp'),
    inject = require('gulp-inject'),
    stripline = require('gulp-strip-line'),
    tslint = require('gulp-tslint');

// all files used in the app
var appFiles:string[] = [
  'index.ts',
  'lib/**/*.ts',
];
// all supporting files used in app (ie: TypeScript interfaces)
var supportingFiles:string[] = [];

/*
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 *
 *      tasks
 *
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 */

/**
 * Generates the app.ts references file dynamically from all application *.ts files.
 */
gulp.task('gen-app-references', function() {
  var target = gulp.src('./app.ts');
  var sources = gulp.src(appFiles.concat(supportingFiles));

  return target.pipe(inject(sources, {
    starttag:  '//{',
    endtag:    '//}',
    transform: (filepath) => {
      return '/// <reference path=".' + filepath + '" />';
    }
  }))
    .pipe(gulp.dest(''));
});

/**
 * Strip all JS comments used in TypeScript => JavaScript. This is designed to be run
 * prior to publishing a refreshed codebase => NPM registry as all TypeScript is
 * ignored when publishing to NPM per .npmignore.
 */
gulp.task('strip-js-ref-comment', () => {
  return gulp.src('**/*.js')
    .pipe(stripline([
      '/// <reference path=',
      '//# sourceMappingURL=']))
    .pipe(gulp.dest(''));
});

/**
 * Lint all TypeScript files except those 3rd party type definitions.
 */
gulp.task('tslint', () => {
  return gulp.src(['**/*.ts', '!**/*.d.ts'])
    .pipe(tslint())
    .pipe(tslint.report('prose'));
});

/**
 * Prepare the package for publication to NPM's registry. This includes:
 * - remove *.js for any TypeScript interfaces (as they are dummy files not used in JS)
 * - remove JS comments added by TypeScript compiler not needed at JS runtime
 * - publish to NPM registry
 */
//gulp.task('npm-publish', ['strip-js-ref-comment'], () => {
//});
