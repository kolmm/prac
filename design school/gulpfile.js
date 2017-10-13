var gulp         = require("gulp");
var less         = require("gulp-less"); // Less
var plumber      = require("gulp-plumber"); //Продолжает работу при ошибках
var postcss      = require("gulp-postcss"); //Postcss
var autoprefixer = require("autoprefixer"); //Ставит префиксы
var server       = require("browser-sync"); //Server
var mqpacker     = require("css-mqpacker"); //Собирает и сортирует media в конце кода
var minify       = require("gulp-csso"); //Минификация css
var rename       = require("gulp-rename"); //Изменяет имя
var imagemin     = require("gulp-imagemin"); //Оптимизирует картинки
var run          = require("run-sequence"); //Поочереди запускает таски
var del          = require("del"); // Удаляет
var njkRender    = require('gulp-nunjucks-render');
var prettify     = require('gulp-html-prettify');

gulp.task("style", function() {
  gulp.src("src/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(server.reload({stream: true}))
    .pipe(gulp.dest("src/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("src/css"));
});

// создаем gulp задачу на компиляцию всех nunjucks шаблонов в текущей директории
gulp.task('nunjucks', function() {
	return gulp.src('src/njk/*.njk')
    .pipe(njkRender({
      path: ['src/njk/'] // String or Array
    }))
		.pipe(prettify({
			indent_size : 2 // размер отступа - 4 пробела
		}))
		.pipe(gulp.dest('src/.'));
});

gulp.task("serv", ["style", "nunjucks"], function() {
  server.init({
    server: "src/."
  });

  gulp.watch("src/less/**/*.less", ["style"]);
  gulp.watch("src/njk/**/*.njk", ['nunjucks']);
  gulp.watch("src/*.html") .on("change", server.reload);
});

gulp.task("images", function() {
  return gulp.src("src/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("src/img"));
});

gulp.task("copy", function() {
  return gulp.src([
    "/fonts/**/*.{woff,woff2,otf}",
    "/img/**",
    "/js/**",
    "/*.html"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task('build', ['clean', 'images', 'style'], function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'src/css/*.css',
        ])
    .pipe(gulp.dest('build/css'))

    var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('build/fonts'))

    var buildImages = gulp.src('src/img/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('build/img'))

    var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('build/js'))

    var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('build'));

});
