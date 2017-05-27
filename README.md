# koa2-csrf
CSRF tokens for Koa >= 2.x (next)

## install 
```
npm install koa2-csrf --save 
```

## Usage

1. Add middleware in Koa app:
```js
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import convert from 'koa-convert';

const app = new Koa();
// add session middleware 
app.keys = [ 'a', 'b' ];
app.use(cover(session()));
// add body parsing
app.use(bodyParser());
// add the csrf middleware (default options are shown)
app.use(csrf({
  invalidStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  ignoreMethods: [ 'GET', 'HEAD','OPTIONS' ],
  ignorePaths: [],
  secretLength: 16,
  saltRounds: 10
}));
app.listen();
```

2. Add the CSRF token in your template forms:
> Jade Template:
```jade
form(action='/register', method='POST')
    input(type='hidden', name='_csrf', value=csrf)
    input(type='email', name='email', placeholder='Email')
    input(type='password', name='password', placeholder='Password')
    button(type='submit') Register
```

> EJS Template
```ejs
<form action="/register" method="POST">
    <input type="hidden" name="_csrf" value="<%= csrf %>" />
    <input type="email" name="email" placeholder="Email" />
    <input type="password" name="password" placeholder="Password" />
    <button type="submit">Register</button>
</form>
```
