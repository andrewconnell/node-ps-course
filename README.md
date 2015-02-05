ps-course
=========
Intended to be used in creating & validating course *.meta file for [Pluralsight](http://www.pluralsight.com). Specifically you can do the following things with this package:

- create a course using code
- load the course in YAML format
- save / load the course in XML (conforming to Pluralsight's `*.meta` schema)
- validate the course properties per Pluralsight's requirements

Rather than using traditional callbacks, promises are returned for async calls using the popular [Q](https://github.com/kriskowal/q) promise library.


Installation
------------
Install using NPM:

````
$ npm install ps-course
````


Load Course form YAML Config File
---------------------------------
````javascript
var Course = require('ps-course'),
    path = require('path');

var course = {};
var sourcePath = path.join(__dirname, 'fixtures');
var validPath = path.join(sourcePath, 'foo-fundamentals', 'course.yaml');

Course.loadFromYaml(validPath)
  .then(function(result) {
    course = result;
  })
  .catch(function(error) {
    console.error(error);
  });
````


Load Course from Pluralsight META File
--------------------------------------
````javascript
var Course = require('ps-course'),
    path = require('path');

var course = {};
var sourcePath = path.join(__dirname, 'fixtures');
var validPath = path.join(sourcePath, 'foo-fundamentals-psexpected', 'foo-fundamentals.meta');

Course.loadFromMeta(validPath)
  .then(function(result) {
    course = result;
  })
  .catch(function(error) {
    console.error(error);
  });
````


Save Course as Pluralsight META File
------------------------------------
````javascript
var Course = require('ps-course');
var course = new Course();

course.id = 'foo-fundamentals';
course.title = 'Foo Fundamentals';
course.shortDescription = 'One to two sentence short description of course. Appears on the main home page for your course, below the course title.';
course.longDescription = 'Paragraph-sized description of the course. Appears on the \'Description\' tab of the course page.';
course.category = 'foo';
course.topics = ['Foo', 'Bar', 'Baz'];
course.modules = ['m1-fooFunModule', 'm2-fooFunModule', 'm3-fooFunModule', 'm4-fooFunModule'];

course.createMetaFile(tempBuildPath)
  .then(function(filePath) {
    console.log('File created at: ' + filePath);
  })
  .catch(function(error) {
    console.error(error);
  });
````


Check the validity of a Course
--------------------------------------
````javascript
var Course = require('ps-course');
var course = new Course();

var course = {};
var sourcePath = path.join(__dirname, 'fixtures');
var validPath = path.join(sourcePath, 'foo-fundamentals-psexpected', 'foo-fundamentals.meta');

Course.loadFromMeta(validPath)
  .then(function(course) {
    // check course's title length is within parameters
    if (!course.isValid){
      console.error('Title field is invalid.');
    }
  })
  .catch(function(error) {
    console.error(error);
  });````

See the tests for full usage.


Development
-----------
The package is written in [TypeScript](http://www.typescriptlang.org), however only the [transpiled](http://en.wikipedia.org/wiki/Source-to-source_compiler) JavaScript is included in the NPM package. In TypeScript development, it's common to use a bunch of `/// <reference path="" />` blocks and the TypeScript compiler generates a source map file that is included at the bottom of the generated JavaScript files. Prior to uploading this to NPM, I've removed these extra comments using a custom [gulp](http://gulpjs.com) task.

If you want to see the full source prior to the "scrubbing" done to prepare for publication to NPM, just get the entire source and run an included gulp task to compile everything.

The type definitions used in the source of this project were acquired from the [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) project. They are all saved in the `tsd.json` file and can be downloaded by running the following:

````
$ tsd reinstall -o
````