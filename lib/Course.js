/// <reference path="./../typings/tsd.d.ts" />
/// <reference path="./../app.ts" />
'use strict';
var Q = require('q');
var fs = require('fs'), path = require('path');
var yaml = require('js-yaml');
var XMLWriter = require('xml-writer'), Xml2Js = require('xml2js');
var Course = (function () {
    function Course() {
        /**
         * Pluralsight assigned course code & name of the folder where the course is found.
         *
         * @type {string}
         */
        this.id = '';
        /**
         * Title of the course.
         *
         * @type {string}
         */
        this.title = '';
        /**
         * Fully qualified path to the course.
         *
         * @type {string}
         */
        this.fullPath = '';
        /**
         * Verbose description of the course.
         *
         * @type {string}
         */
        this.shortDescription = '';
        /**
         * Verbose description of the course.
         *
         * @type {string}
         */
        this.longDescription = '';
        /**
         * Category where the course will be listed in Pluralsight course catalog.
         *
         * @type {string}
         */
        this.category = '';
        /**
         * Collection of tags used to find the course.
         * @type {Array{string}}
         */
        this.topics = [];
        /**
         * Collection of modules in the course.
         *
         * @type {Array{string}}
         */
        this.modules = [];
    }
    /**
     * Creates the course's metadata file for submission to Pluralsight.
     *
     * @param {string} buildPath    Fully qualified directory path (without the filename) where to build the metadata file.
     *
     * @returns {Q.Promise<string>} Fully qualified path of the file that was created.
     */
    Course.prototype.createMetaFile = function (buildPath) {
        var self = this;
        var deferred = Q.defer();
        try {
            var metaDataFilePath = path.join(buildPath, self.id + '.meta');
            // create the xml writer
            var metaFileStream = fs.createWriteStream(metaDataFilePath);
            metaFileStream.on('close', function () {
                deferred.resolve(metaDataFilePath);
            });
            var xmlWriter = new XMLWriter(true, function (content, encoding) {
                metaFileStream.write(content, encoding);
            });
            // write head of the document
            var xmlCourse = xmlWriter.startDocument('1.0', 'utf-8').startElement('course').writeAttribute('xmlns', 'http://pluralsight.com/sapphire/module/2007/11');
            // add title & descriptionS
            xmlCourse.writeElement('title', self.id);
            xmlCourse.writeElement('shortDescription', self.shortDescription);
            xmlCourse.writeElement('description', self.longDescription);
            // add modules
            xmlCourse.startElement('modules');
            self.modules.forEach(function (element, index) {
                var moduleName = self.id + '-m' + index;
                // todo: remove hard coded author
                // add module
                xmlCourse.startElement('module').writeAttribute('author', 'andrew-connell').writeAttribute('name', moduleName).endElement();
            });
            xmlCourse.endElement(); //</modules>
            // add topics
            xmlCourse.startElement('topics');
            self.topics.forEach(function (element) {
                xmlCourse.writeElement('topic', element);
            });
            xmlCourse.endElement(); //<topics />
            // add category
            xmlCourse.writeElement('category', self.category);
            xmlCourse.endElement(); //<course />
            // close the stream & save it
            metaFileStream.end();
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    };
    /**
     * Validates the title of a course. Specifically looks at the length of the string & that it
     * does not exceed the value set in the config.
     *
     * @returns {string[]}         Flag indicating the title is valid.
     */
    Course.prototype.validate = function () {
        var self = this;
        var results = [];
        //TODO refactor hard coded value to config
        var COURSE_TITLE_MAX_LENGTH = 65;
        if (!self.title || self.title.length > COURSE_TITLE_MAX_LENGTH) {
            results.push('Course title length (' + self.title.length + ') invalid. Must be less than ' + COURSE_TITLE_MAX_LENGTH);
        }
        return results;
    };
    /////////     STATIC METHODS     ///////////////////////////////
    /**
     * Obtains the fully qualified path to a module.
     *
     * @param {string}    rootPath      Fully qualified path to the location of all courses.
     * @param {string}    courseId      Unique ID of the course.
     * @returns {string}                Fully qualified path to the course folder.
     */
    Course.getFullPath = function (rootPath, courseId) {
        var result = path.join(rootPath, courseId);
        // make sure it is valid
        if (!fs.existsSync(result)) {
            throw new Error('Course not found at specified path: ' + result);
        }
        return result;
    };
    /**
     * Loads a course object from a YAML configuration file. It will also add in the fully qualified
     * path & id of the course as a property and also clean out the newlines in the descriptions.
     *
     * @param {string}    fullPath      Fully qualified path to the course folder.
     * @returns {Q.Promise<Course>}     Course object loaded from the YAML config file.
     */
    Course.loadFromYaml = function (fullPath) {
        var deferred = Q.defer();
        if (!fs.existsSync(fullPath)) {
            deferred.reject(new Error('Path not valid: ' + fullPath));
        }
        else {
            try {
                var course = new Course();
                // read in the file
                var doc = yaml.safeLoad(fs.readFileSync(fullPath, 'utf8'));
                // load properties
                course.id = doc.course.id;
                course.title = doc.course.title;
                course.category = doc.course.category;
                course.topics = doc.course.topics;
                course.modules = doc.course.modules;
                // remove any trailing description if present
                course.shortDescription = doc.course.shortDescription.replace('\n', '');
                course.longDescription = doc.course.longDescription.replace('\n', '');
                // add the full path to the course
                course.fullPath = path.dirname(fullPath);
                deferred.resolve(course);
            }
            catch (error) {
                deferred.reject(error);
            }
        }
        return deferred.promise;
    };
    /**
     * Loads a course object from a *.meta (XML) configuration file. It will also add
     * in the fully qualified path & id of the course as a property and also clean
     * out the newlines in the descriptions.
     *
     * @param {string}    fullPath      Fully qualified path to the course META file.
     * @returns {Q.Promise<Course>}     Course object loaded from the META config file.
     */
    Course.loadFromMeta = function (fullPath) {
        var deferred = Q.defer();
        if (!fs.existsSync(fullPath)) {
            deferred.reject(new Error('Path not valid: ' + fullPath));
        }
        else {
            // read in the file
            var parser = new Xml2Js.Parser();
            var parseString = Q.denodeify(parser.parseString);
            parseString(fs.readFileSync(fullPath, 'utf8')).then(function (doc) {
                var course = new Course();
                // load properties
                course.title = doc.course.title[0];
                course.category = doc.course.category[0];
                // convert topics => array
                var topics = doc.course.topics[0].topic;
                if (topics && topics.length > 0) {
                    topics.forEach(function (element, index) {
                        course.topics.push(topics[index]);
                    });
                }
                // convert modules => array
                var modules = doc.course.modules[0].module;
                if (modules && modules.length > 0) {
                    modules.forEach(function (element, index) {
                        // hack: omitting the 'author' attribute
                        //  as it isn't taken into account on YAML config
                        course.modules.push(modules[index].$.name);
                    });
                }
                // remove any trailing description if present
                course.shortDescription = doc.course.shortDescription[0].replace('\n', '');
                course.longDescription = doc.course.description[0].replace('\n', '');
                // add the full path to the course
                course.fullPath = path.dirname(fullPath);
                return Q(course);
            }).then(function (course) {
                deferred.resolve(course);
            }).catch(function (error) {
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };
    return Course;
})();
module.exports = Course;
//# sourceMappingURL=course.js.map