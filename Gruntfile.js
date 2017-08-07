module.exports = function(grunt) {

  // configure the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: {
        src: [ 'dist' ]
      },
      build: {
        src: [
          'build/**/*.js', '!build/module.js',
          '!build/occasion-sdk.js', '!build/occasion-sdk.min.js'
        ]
      },
      specs: {
        src: 'spec/spec.js'
      }
    },
    babel: {
      options: {
        plugins: ['transform-class-properties'],
        presets: ['es2015']
      },
      build: {
        files: {
          'build/occasion-sdk.js': 'build/occasion-sdk.js'
        }
      }
    },
    umd: {
      build: {
        options: {
          src: 'build/occasion-sdk.js',
          objectToExport: 'Occasion',
          deps: {
            'default': [{ 'active-resource': 'ActiveResource' }]
          }
        }
      },
      specs: {
        options: {
          src: 'spec/spec.js',
          objectToExport: 'OccasionSDKSpecs',
          deps: {
            'default': [
              { 'active-resource': 'ActiveResource' },
              { 'occasion-sdk': 'Occasion' },
              { 'underscore': '_' },
              { 'jasmine-jquery': null },
              { 'jasmine-ajax': null }
            ]
          }
        }
      }
    },
    uglify: {
      build: {
        options: {
          mangle: false
        },
        files: {
          'build/occasion-sdk.min.js': 'build/occasion-sdk.js'
        }
      }
    },
    concat: {
      raw: {
        options: {
          banner:
          '/*\n' +
          '\tOccasion Javascript SDK <%= pkg.version %>\n' +
          '\t(c) <%= grunt.template.today("yyyy") %> Peak Labs, LLC DBA Occasion App\n' +
          '\tOccasion Javascript SDK may be freely distributed under the MIT license\n' +
          '*/\n\n'
        },
        src: 'build/occasion-sdk.js',
        dest: 'dist/occasion-sdk.js'
      },
      min: {
        options: {
          banner:
          '/*\n' +
          '\tOccasion Javascript SDK <%= pkg.version %>\n' +
          '\t(c) <%= grunt.template.today("yyyy") %> Peak Labs, LLC DBA Occasion App\n' +
          '\tOccasion Javascript SDK may be freely distributed under the MIT license\n' +
          '*/\n\n'
        },
        src: 'build/occasion-sdk.min.js',
        dest: 'dist/occasion-sdk.min.js'
      },
      build: {
        src: [
          'src/init/client.js',
          'src/init/modules.js',
          'src/*.js',
          'src/**/*.js',
        ],
        dest: 'build/occasion-sdk.js'
      },
      specs: {
        src: ['spec/support/*.js', 'spec/**/*.js'],
        dest: 'spec/spec.js'
      }
    },
    watch: {
      source: {
        files: 'src/**/*.coffee',
        tasks: [ 'build' ]
      }
    },
    connect: {
      test: {
        options: {
          port: 8000
        }
      }
    },
    jasmine: {
      build: {
        options: {
          keepRunner: true,
          specs: 'spec/spec.js',
          host: 'http://127.0.0.1:8000',
          vendor: [
            '/node_modules/jquery/dist/jquery.min.js'
          ],
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfig: {
              baseUrl: '/',
              paths: {
                "active-resource": '/node_modules/active-resource/dist/active-resource.min',
                "jquery": '/node_modules/jquery/dist/jquery.min',
                "underscore": '/node_modules/underscore/underscore-min',
                "underscore.string": '/node_modules/underscore.string/dist/underscore.string',
                "underscore.inflection": '/node_modules/underscore.inflection/lib/underscore.inflection',
                "occasion-sdk": '/build/occasion-sdk',
                "jasmine-jquery": '/node_modules/jasmine-jquery/lib/jasmine-jquery',
                "jasmine-ajax": '/node_modules/jasmine-ajax/lib/mock-ajax'
              }
            }
          }
        }
      }
    }

  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-umd');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // define the tasks
  grunt.registerTask(
    'compile',
    'Compiles the source files into 1) a raw UMD module file and 2) a minified UMD module file.',
    [ 'concat:build', 'babel:build', 'umd:build', 'uglify', 'clean:build' ]
  );

  grunt.registerTask(
    'spec',
    'Compiles and runs the Javascript spec files to test source code.',
    [ 'clean:specs', 'concat:specs', 'umd:specs', 'connect:test', 'jasmine:build' ]
  )

  grunt.registerTask(
    'build',
    'Creates a temporary build of the library in the build folder, then runs the specs on it.',
    [ 'clean:build', 'compile', 'spec' ]
  );

  grunt.registerTask(
    'release',
    'Creates a new release of the library in the dist folder.',
    [ 'clean:dist', 'compile', 'concat' ]
  );

  grunt.registerTask(
    'default',
    'Watches the project for changes, automatically builds them and runs specs.',
    [ 'build', 'watch' ]
  );
};
