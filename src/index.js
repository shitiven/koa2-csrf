import uid from 'uid-safe';
import bcrypt from 'bcryptjs';

class Token {

  static genSecret(len) {
    return uid.sync(len);
  }

  static create(secret, saltRounds) {
    return bcrypt.hashSync(secret, bcrypt.genSaltSync(saltRounds));
  }

  static verify(secret, token) {
    return bcrypt.compareSync(secret, token);
  }


}

class CSRF {

  constructor(opts) {

    this.opts = Object.assign({
      invalidStatusCode: 403,
      invalidTokenMessage: 'Invalid CSRF token',
      ignoreMethods: [ 'GET', 'HEAD','OPTIONS' ],
      ignorePaths: [],
      secretLength: 16,
      saltRounds: 10
    }, opts);

    if (!this.opts.ignoreMethods instanceof Array) {
      throw new Error(
        'csrf middleware option ignoreMethods ' +
        'must return an array'
      )
    }

    if (!this.opts.ignoreMethods instanceof Array) {
      throw new Error(
        'csrf middleware option ignorePaths ' +
        'must return an array'
      )
    }

    return this.middleware;
  }

  get middleware() {

    return async (ctx, next) => {

      const that = this;

      if (!ctx.csrf) {
        Object.defineProperty(ctx, 'csrf', {
          get() {
            if (ctx._csrf) {
              return ctx._csrf;
            }
            if (!ctx.session) {
              return null;
            }
            if (!ctx.session.secret) {
              ctx.session.secret = Token.genSecret(that.opts.secretLength);
            }

            const token = Token.create(ctx.session.secret, that.opts.saltRounds);
            ctx._csrf = token;
            return token;
          }
        });
      }

      if (!ctx.response.csrf) {
        Object.defineProperty(ctx.response, 'csrf', {
          get() {
            return ctx.csrf;
          }
        });
      }

      ctx.state.csrf = ctx.csrf;

      if (that.opts.ignoreMethods.indexOf(ctx.method) !== -1) {
        await next();
        return;
      }

      if (that.opts.ignorePaths.indexOf(ctx.path) !== -1) {
        await next();
        return;
      }

      const bodyToken = (
          ctx.request.body &&
          ctx.request.body._csrf
      ) ? ctx.request.body._csrf : null;

      const token = bodyToken ||
                ctx.get('csrf-token') ||
                ctx.get('xsrf-token') ||
                ctx.get('x-csrf-token') ||
                ctx.get('x-xsrf-token');

      if (!token) {
        return ctx.throw(
            that.opts.invalidStatusCode,
            that.opts.invalidTokenMessage
        );
      }

      if (!Token.verify(ctx.session.secret, token)) {
        return ctx.throw(
            that.opts.invalidStatusCode,
            that.opts.invalidTokenMessage
        );
      }

      await next();

    };

  }

}

export default function csrf(opts) {
  if (opts && typeof opts !== 'object') {
    throw new Error('Csrf middleware option must return an object.')
  }
  return new CSRF(opts || {});
}
