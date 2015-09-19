module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'assets/',
            src: ['**/*'],
            dest: 'dist/'
          },
          {
            expand: true,
            src: ['lib/**'],
            dest: 'dist/'
          }
        ]
      }
    },
    smash: {
      dist: {
        src: 'src/GPSTools/gpstools.js',
        dest: 'dist/tmp/gpstools.js'
      }
    },
    riot: {
      options: {
        concat: true
      },
      dist: {
        src: 'src/tags/*.tag',
        dest: 'dist/tmp/tags.js'
      }
    },
    concat: {
      dist: {
        src: ['src/stores/*.js', '<%= riot.dist.dest %>', '<%= smash.dist.dest %>'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'dist/index.html': ['index.html']
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-smash')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-riot')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-processhtml')

  grunt.registerTask('default', ['copy', 'smash', 'riot', 'concat', 'processhtml'])
};
