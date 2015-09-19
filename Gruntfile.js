module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    smash: {
      dist: {
        src: 'src/GPSTools/gpstools.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= smash.dist.dest %>']
        }
      }
    },
    riot: {
      options: {
        concat: true
      },
      dist: {
        src: 'src/tags/*.tag',
        dest: 'dist/tags.js'
      }
    },
    concat: {
      dist: {
        src: ['src/stores/*.js'],
        dest: 'dist/stores.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-smash')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-riot')

  grunt.registerTask('default', ['smash', 'uglify', 'riot', 'concat'])
};
