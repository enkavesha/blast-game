const gulp = require('gulp');
const {series, parallel} = gulp;
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const browsersync = require('browser-sync');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const del = require('del');

function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: './'
        },
        port: 3000
    });
    done();
}

function browserSyncReload(done) {
    browsersync.reload();
    done();
}

function clean() {
    return del(['dist/*']);
}

function css() {
    return gulp.src([
        'src/css/**/*',
    ])
        .pipe(concat('style.css'))
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['safari 9', 'ios_saf 9', 'chrome 52'],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./src-bundle/'))
}

function js() {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('jsbundle.js'))
        .pipe(gulp.dest('./src-bundle/'))
        .pipe(rename('jsbundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src-bundle/'))
}

function watchFiles() {
    gulp.watch('src/css/**/*.scss', css);
    gulp.watch('src/js/**/*.js', js);
    gulp.watch('src/**/*', browserSyncReload);
}

const build = series(clean, parallel(css, js));
const watch = series(css, js, parallel(watchFiles));
const sync = series(css, js, parallel(watchFiles, browserSync));

exports.js = js;
exports.css = css;
exports.build = build;
exports.watch = watch;
exports.sync = sync;
exports.default = build;