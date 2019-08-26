/* eslint-disable space-before-function-paren */
/* eslint-disable func-names */
/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable prefer-template */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable object-shorthand */
const { src, dest, watch } = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const glob = require('glob');

const config = {
  // proxy
  proxy: '',

  // sources
  src: './src',

  // final files path
  build: './build',

  // Assets path
  assets: {
    css: ['css/**/*.css'],
    less: ['less/**/*.less'],
    js: ['js/**/*.js']
  },

  concat_css: 'full.css',
  concat_js: 'app.js'
};

function lessCompiler() {
  if (config.concat_css !== undefined) {
    return src(config.src + '/' + config.assets.less)
      .pipe(less())
      .pipe(concat(config.concat_css))
      .pipe(dest(config.build + '/css'))
      .pipe(browserSync.stream());
  }
  return src(config.src + '/' + config.assets.less)
    .pipe(less())
    .pipe(dest(config.build + '/css'))
    .pipe(browserSync.stream());
}

function jsConcat() {
  if (config.concat_js !== undefined) {
    return src(config.src + '/' + config.assets.js)
      .pipe(concat(config.concat_js))
      .pipe(dest(config.build + '/js'))
      .pipe(browserSync.stream());
  }
  return src(config.src + '/' + config.assets.js)
    .pipe(dest(config.build + '/js'))
    .pipe(browserSync.stream());
}

exports.less = lessCompiler;
exports.js = jsConcat;

exports.default = function() {
  lessCompiler();
  jsConcat();

  browserSync.init({
    ghostMode: false,
    server: {
      baseDir: './'
    },

    rewriteRules: [
      {
        // CSS inject at the end of <head>
        match: /<\/head>/i,
        fn: function(req, res, match) {
          let localCssAssets = '';

          for (let index = 0; index < config.assets.css.length; index++) {
            const files = glob.sync(config.assets.css[index], {
              cwd: config.build
            });

            console.log('CSS Files:', files);

            for (const file in files) {
              localCssAssets +=
                '<link rel="stylesheet" type="text/css" href="' +
                config.build.replace('.', '') +
                '/' +
                files[file] +
                '"/>';
            }
          }

          return localCssAssets + match;
        }
      },
      {
        // JS inject at the end of <body>
        match: /<\/body>/i,
        fn: function(req, res, match) {
          let localJSAssets = '';

          for (let index = 0; index < config.assets.js.length; index++) {
            const files = glob.sync(config.assets.js[index], {
              cwd: config.build
            });

            console.log('JS Files:', files);

            for (const file in files) {
              // eslint-disable-next-line operator-linebreak
              localJSAssets +=
                '<script src="' +
                config.build.replace('.', '') +
                '/' +
                files[file] +
                '"></script>';
            }
          }

          return localJSAssets + match;
        }
      }
    ],
    serveStatic: [
      {
        route: ['/build', '/assets'],
        dir: ['./build', './assets']
      }
    ],
    watchTask: true
  });

  // Śledzenie zmian w pliku, przy zapisie wywołujemy funkcje podaną w drugim parametrze
  watch('src/less/*less', lessCompiler);
  watch('src/js/*.js', jsConcat);
  watch('src/html/*.html').on('change', browserSync.reload);
};
