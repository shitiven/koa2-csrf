import { describe, it } from 'mocha';
import supertest from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import convert from 'koa-convert';
import csrf from '..';

describe('Useful usage tests', () => {

  const app = new Koa();
  app.keys = [ 'a', 'b' ];
  app.use(convert(session()));
  app.use(bodyParser());
  app.use(csrf());
  app.use(ctx => {
    ctx.body = ctx.csrf;
  });
  const request = supertest.agent(app.listen());

  it('Missing token then return default invalide message', done => {

    request.post('/')
        .expect(403)
        .expect('Invalid CSRF token')
        .end(done);

  });

  it('Correct csrf taken', done => {
    request.get('/')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          request
            .post('/')
            .send({
              _csrf: res.text
            })
            .expect(200)
            .end(done);
        });
  });

  it('Invalid csrf taken', done => {
    request.get('/')
        .expect(200)
        .end(err => {
          if (err) {
            return done(err);
          }
          request
            .post('/')
            .send({
              _csrf: 'invalid token'
            })
            .expect(403)
            .end(done);
        });
  });

  it('csrf-token filed in headers', done => {

    request.get('/')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          request
            .post('/')
            .set('csrf-token', res.text)
            .expect(200)
            .end(done);
        });

  });

  it('ignorePaths test', done => {

    const ap = new Koa();
    ap.keys = [ 'a', 'b' ];
    ap.use(convert(session()));
    ap.use(bodyParser());
    ap.use(csrf({
      ignorePaths: [ '/' ]
    }));
    ap.use(ctx => {
      ctx.body = ctx.csrf;
    });

    supertest(ap.listen())
      .post('/')
      .expect(200)
      .end(done);

  });

});
