const fs = require('fs');
const gulp = require('gulp');
const connect = require('gulp-connect');
const open = require('open');
const chalk = require('chalk');

const argv = process.argv;
const cwd = argv[argv.indexOf('--cwd') + 1];
const port = argv[argv.indexOf('--port') + 1];
const host = argv[argv.indexOf('--host') + 1];

gulp.task('connect', function() {
  connect.server({
    root: cwd,
    host,
    port,
    livereload: {
      port: 3000 + parseInt(Math.random() * 1000),
    },
  }, function() {
    console.log(chalk.yellow('Available on:\n'), `http://${host}:` + chalk.green(port));
    open(`http:${host}:${port}`);
  });
});

// Globs to watch on the file system.
const suffixList = ['.html', '.css', '.js', '.png', '.jpg', '.gif'];
const globs =  suffixList.map((suffix) => `${cwd.replace(/\\/g, '/')}/**/*${suffix}`);
// Exclude the node_modules
globs.push(`!${cwd.replace(/\\/g, '/')}/**/node_modules/*`);

// Cache files content，when press `ctrl+s` will trigger gulp.change event although file has no chane,
// so we should compare the file content to judge whether it has changed.
const fileContentCache = {};

gulp.task('watch', function () {
  gulp.watch(globs, function(event) { 
    const filePath = event.path;
      try {
        const fileContent = fs.readFileSync(event.path, 'utf8');
        if(fileContent !== fileContentCache[filePath]) {
          console.log(filePath, 'has', chalk.yellow(event.type));
          fileContentCache[filePath] = fileContent;
          gulp.src(globs)
          .pipe(connect.reload())
        }
      } catch(e) {
        console.error(JSON.stringify(e));
      }
    });
});

gulp.task('default', ['connect', 'watch']);