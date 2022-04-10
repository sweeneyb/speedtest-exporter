const Koa = require('koa');
const _ = require('koa-route');
const SpeedTest = require('./speed-test');
const promFormatter = require('./prom-formatter');

const app = new Koa();

var minutes = 1, the_interval = minutes * 60 * 1000;

let testResults;
let upperV = {}

function test() {
  let test = new SpeedTest();
  test.run()
    .then(v => {
      upperV = v
      testResults = promFormatter.format(v);
      console.log('speedtest: ', {download: v.speeds.download, upload: v.speeds.upload, ping: v.server.ping});
    })
    .catch(e => {
      console.log('e', e);
    });
}

setInterval(test, the_interval)
test()

const routes = {
  metrics: async ctx => {
    console.log('/metrics');


    ctx.type = 'text/plain; version=0.0.4';
    ctx.body = promFormatter.format(upperV);;

  }
};

app.use(_.get('/metrics', routes.metrics));
app.use(_.get('/metrics/', routes.metrics));

app.listen(9696);
