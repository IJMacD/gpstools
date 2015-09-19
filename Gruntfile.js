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
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    riot: {
      options: {
        concat: true
      },
      dist: {
        src: 'src/tags/*.tag',
        dest: 'dist/js/tags.js'
      }
    },
    concat: {
      dist: {
        src: ['src/stores/*.js', '<%= riot.dist.dest %>'],
        dest: 'dist/js/index.js'
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
    jshint: {
      files: ['src/GPSTools/*', 'src/stores/*'],
      options: {
        browser: true,
        devel: true,
        globals: {
          'GPSTools': true,
          '$': false,
          'ol': false,
          'riot': false,
          'logging': true,
          'RGraph': false
        },
        esnext: true,
        asi: true,
        undef: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-smash')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-riot')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-processhtml')
  grunt.loadNpmTasks('grunt-contrib-jshint')

  grunt.registerTask('default', ['jshint', 'copy', 'smash', 'riot', 'concat', 'processhtml'])
};
