/// <reference path="./../typings/tsd.d.ts" />
/// <reference path="./../app.ts" />

'use strict';

var q = require('Q');
var os = require('os'),
  fs = require('fs'),
  path = require('path'),
  rimraf = require('rimraf');
var chai = require('chai'),
  expect = chai.expect,
  should = chai.should();
import Course = require('../lib/Course');

describe('Course', () => {
  var course;
  var sourcePath = path.join(__dirname, 'fixtures');
  var courseIdYaml = 'foo-fundamentals';
  var courseIdMeta = 'foo-fundamentals-psexpected';

  before((done) => {
    course = new Course();
    done();
  });

  after((done) => {
    done();
  });

  describe('getFullPath()', () => {

    it('will return valid course path', (done) => {
      var result = Course.getFullPath(sourcePath, courseIdYaml);

      should.exist(result);
      expect(result).to.equal(path.join(sourcePath, courseIdYaml));

      done();
    });

    it('will fail on invalid course path', (done) => {
      // make sure it throws an exception
      expect(() => {
        Course.getFullPath(sourcePath, 'invalid');
      }).to.throw('Course not found at specified path: ' + sourcePath + '/invalid');

      done();
    });

  });

  describe('loadFromYaml()', () => {
    var validPath = path.join(sourcePath, courseIdYaml, 'course.yaml');
    var inValidPath = path.join(sourcePath, 'xxx');

    beforeEach((done) => {
      Course.loadFromYaml(validPath)
        .then((result) => {
          course = result;
          done();
        });
    });

    it('will return a valid object', (done) => {

      expect(course).to.not.be.undefined;
      expect(course.id).to.be.equal('foo-fundamentals');
      expect(course.title).to.not.be.empty;
      expect(course.shortDescription).to.not.be.empty;
      expect(course.longDescription).to.not.be.empty;
      expect(course.modules.length).to.be.greaterThan(1);

      done();
    });

    it('will fail on an invalid path', (done) => {
      Course.loadFromYaml(inValidPath)
        .then((course) => {
          expect(course).to.be.undefined;
          done();
        })
        .catch((error) => {
          expect(error).to.not.be.undefined;
          done();
        });
    });

    it('will return valid object with id', (done) => {

      expect(course.id).to.equal('foo-fundamentals');

      done();
    });

    it('will return valid object with title', (done) => {

      expect(course.title).to.equal('Foo Fundamentals');

      done();
    });

    it('will return valid object with category', (done) => {

      expect(course.category).to.equal('foo');

      done();
    });

    it('will return valid object with shortDescription without trailing newline', (done) => {

      /*tslint:disable:max-line-length */
      expect(course.shortDescription).to.equal('One to two sentence short description of course. Appears on the main home page for your course, below the course title.');
      /*tslint:enable:max-line-length */

      done();
    });

    it('will return valid object with longDescription without trailing newline', (done) => {

      /*tslint:disable:max-line-length */
      expect(course.longDescription).to.equal('Paragraph-sized description of the course. Appears on the \'Description\' tab of the course page.');
      /*tslint:enable:max-line-length */

      done();
    });

    it('will return valid object with collection of topics', (done) => {

      expect(course.topics.length).to.be.greaterThan(1);

      done();
    });

    it('will return valid object with collection of modules', (done) => {

      expect(course.modules.length).to.equal(4);

      done();
    });

  });

  describe('loadFromMeta()', () => {
    var validPath = path.join(sourcePath, courseIdMeta, 'foo-fundamentals.meta');
    var inValidPath = path.join(sourcePath, 'xxx');

    beforeEach((done) => {
      Course.loadFromMeta(validPath)
        .then((result) => {
          course = result;
          done();
        });

    });

    it('will return a valid object', (done) => {

      expect(course).to.not.be.undefined;
      expect(course.title).to.not.be.empty;
      expect(course.shortDescription).to.not.be.empty;
      expect(course.longDescription).to.not.be.empty;
      expect(course.modules.length).to.be.greaterThan(1);

      done();
    });

    it('will fail on an invalid path', (done) => {
      Course.loadFromMeta(inValidPath)
        .then((course) => {
          expect(course).to.be.undefined;
          done();
        })
        .catch((error) => {
          expect(error).to.not.be.undefined;
          done();
        });

    });

    it('will return valid object with title', (done) => {

      expect(course.title).to.equal('Foo Fundamentals');

      done();
    });

    it('will return valid object with category', (done) => {

      expect(course.category).to.equal('foo');

      done();
    });

    it('will return valid object with shortDescription without trailing newline', (done) => {

      /*tslint:disable:max-line-length */
      expect(course.shortDescription).to.equal('One to two sentence short description of course. Appears on the main home page for your course, below the course title.');
      /*tslint:enable:max-line-length */

      done();
    });

    it('will return valid object with longDescription without trailing newline', (done) => {

      /*tslint:disable:max-line-length */
      expect(course.longDescription).to.equal('Paragraph-sized description of the course. Appears on the \'Description\' tab of the course page.');
      /*tslint:enable:max-line-length */

      done();
    });

    it('will return valid object with collection of topics', (done) => {

      expect(course.topics.length).to.be.greaterThan(1);

      done();
    });

    it('will return valid object with collection of modules', (done) => {

      expect(course.modules.length).to.equal(4);

      done();
    });

  });

  describe('createMetaFile()', () => {

    var tempBuildPath:string = '',
      validCoursePath = path.join(sourcePath, courseIdYaml, 'course.yaml'),
      course:Course;

    beforeEach((done) => {
      // create a temp folder
      tempBuildPath = path.join(os.tmpdir(), 'psproducertemp');
      fs.mkdirSync(tempBuildPath);

      // load the course
      Course.loadFromYaml(path.join(validCoursePath))
        .then((result) => {
          course = result;
          done();
        });
    });

    afterEach((done) => {
      // remove the temp folder
      rimraf.sync(tempBuildPath);

      done();
    });

    it('will create course meta file', (done) => {
      course.createMetaFile(tempBuildPath)
        .then((filePath) => {
          // ensure path returned in callback
          expect(filePath).to.not.be.undefined;

          // validate the path & file present
          expect(filePath).to.be.a.path;
          expect(filePath).to.be.a.file;

          // validate file created
          expect(path.join(tempBuildPath, courseIdYaml + '.meta')).to.be.a.path;

          //todo: check for validity of file contents
        })
        .then(() => {
          done();
        })
        .catch((error) => {
          expect(error).to.be.undefined;
          done();
        });
    });

  });

  describe('titleIsValid', () => {

    beforeEach((done) => {
      course = new Course();
      done();
    });

    it('will fail when the string is too long', (done) => {
      course.title = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';

      var results = course.validate();

      expect(results.length).to.be.equal(1);

      done();
    });

    it('will pass when string is within parameters', (done) => {
      course.title = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';

      var results = course.validate();

      expect(results.length).to.be.equal(0);

      done();
    });

  });

});