module.exports = function(grunt) {

  var webpack = require("webpack")
  var webpackConfig = require("./webpack.config.js")

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
    webpack: {
      dist: {
        options: webpackConfig,
        entry: "./src/entry.js",
        output: {
          path: 'dist/js/',
          filename: "index.js"
        },
        plugins: [
          new webpack.ProvidePlugin({
            riot: 'riot'
          })
        ],
        module: {
            preLoaders: [
              {
                test: /\.tag$/,
                exclude: /node_modules/,
                loader: 'riotjs-loader',
                query: { type: 'none' }
              }
            ],
            loaders: [
              {
                test: /(\.js$|\.tag$)/,
                exclude: /node_modules/,
                loader: "babel"
              }
            ]
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/js/<%= pkg.name %>.min.js': ['<%= smash.dist.dest %>'],
          'dist/js/index.min.js': ['dist/js/index.js']
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
    },
    clean: {
      dist: ['dist/js/tags.js']
    },
    notify: {
      dist: {
        options: {
          message: "Build Complete"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-smash')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-processhtml')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-notify')
  grunt.loadNpmTasks('grunt-webpack')

  grunt.registerTask('default', ['jshint', 'copy', 'smash', 'webpack', 'uglify', 'processhtml', 'clean', 'notify'])
};
