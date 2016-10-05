var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var assert = require('assert');
var AppTester = vumigo.AppTester;

describe("text utils", function() {
    describe("split_parts", function() {
        it("should ignore leading and lagging whitespace", function() {
            assert.deepEqual(
                go.utils.split_parts("  a  "),
                ["a"]
            );
        });
        it("should return null if there are no characters", function() {
            assert.deepEqual(
                go.utils.split_parts("  "),
                null
            );
            assert.deepEqual(
                go.utils.split_parts(""),
                null
            );
        });
        it("should ignore multiple whitespace characters between words", function() {
            assert.deepEqual(
                go.utils.split_parts("  a  b  "),
                ["a", "b"]
            );
        });
    });
});
