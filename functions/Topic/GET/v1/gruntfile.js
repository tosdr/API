module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            default: {
                dot: true,
                src: ["build/**/*"]
            },
        },
        ts: {
            default: {
                tsconfig: true
            },
        },
    });
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.registerTask('default', ['clean', 'ts']);
};