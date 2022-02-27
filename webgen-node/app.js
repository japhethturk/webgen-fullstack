const restify = require('restify');
const bcrypt = require('bcrypt');
const rjwt = require('restify-jwt-community');
const jwt = require('jsonwebtoken');
const config = require('./config.json');
const user = require('./lib/user');
const blog = require('./lib/blog');
const article = require('./lib/article');


var corsMiddleware = require('restify-cors-middleware');
var cors = corsMiddleware({
      preflightMaxAge: 5,
      origins: ['*'],
      allowHeaders:['x-access-token, Origin, Content-Type, Accept, Authorization'],
      exposeHeaders:[]
    });

// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

// async function ls() {
//     const { stdout, stderr } = await exec('dir');
//     console.log('stdout:', stdout);
//     console.log('stderr:', stderr);
// }

const server = restify.createServer();
server.pre(cors.preflight);
server.use(cors.actual);

// server.use(
//   function crossOrigin(req,res,next){
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "*");
//     return next();
//   }
// );


server.use(rjwt(config.jwt).unless({
  path: [
    '/auth',
    /\/static.*\/.*/,
    /\/articles.*\/.*/
  ]
}));


server.use(restify.plugins.queryParser());
// server.use(plugins.multipartBodyParser());  // multipart etkinleştirme
server.use(
  restify.plugins.bodyParser({
    mapParams: false,
    requestBodyOnGet: true
  })
);

function random(min,max) {
  return Math.floor((Math.random())*(max-min+1))+min;
}

server.post('/checkToken', (req, res, next) => {
  return res.json({
    code: 'ok',
  })
});

server.post('/auth', function(req, res, next) {
  try {
    user.authenticate(req.body.email, req.body.password).then(data => {
      if (data === null) {
        return res.json({
          code: 'error',
          message: {severity: "error", summary: "Hata! ", detail: " Kulanıcı bulunamadı", sticky: true,}
        })
      } else {
        delete data.password;
        let token = jwt.sign(data, config.jwt.secret, {
          expiresIn: '1440m' // token 1440 dakika içinde sona eriyor
        });
        // retrieve issue and expiration times
        let { iat, exp } = jwt.decode(token);
        return res.json({
          code: 'ok',
          user: {
            id: data.id,
            role: data.role,
            email: data.email,
            iat, 
            exp, 
            token 
          }
        })
      }
    })
  } catch (e) {
    return res.json({
      code: 'error',
      message: e.message
    })
  }
});

server.get('/user/all', function(req, res, next) {
  try {
    user.all().then(data => {
      return res.json(data)
    })
  } catch (e) {
    return res.json({
      code: 'error',
      message: e.message,
    })
  }
});

server.post('/user/edit/id/:id', function(req, res, next) {
  try {
    const id = req.params.id;
    const email = req.body.email
    const password = req.body.password

    user.authenticate(req.body.userEmail, req.body.password).then(data => {
      if (data === null) {
        return res.json({
          code: 'error',
          message: {severity: "error", summary: "Hata! ", detail: " Kulanıcı bulunamadı", sticky: true,}
        })
      } else {
        data.email = email
        if (password !== '') {
          data.password = bcrypt.hashSync(password, 10)
        }
        user.edit(data).then(dt => {
          return res.json(dt)
        })
      }
    })
   
  } catch (e) {
    return res.json({
      code: 'error',
      message: e.message,
    })
  }
});

server.post('/user/add', function create(req, res, next) {
  try {
    // if (req.user.role === "admin") {
      var jsonBody = req.body;
      bcrypt.hash(jsonBody.password, 12).then(hash => {
        const id = random(10000, 99999);
        user.add(id, jsonBody.email, jsonBody.password, "editor").then(data => {
          delete data.password;
          return res.json(data)
        })
      });
    // } else {
    //   return res.json({code:"havent-privlage"})
    // }
  } catch (e) {
    return res.json({
      code: 'error',
      message: e.message,
    })
  }
});

server.get('/user/remove/id/:id', function create(req, res, next) {
  const id = req.params.id;
  if (req.user.role === "admin") {
    user.remove(id).then(data => {
      return res.json(data)
    })
  } else {
    return res.json({code:"havent-privlage"})
  }
});

// statik dosyalara ulaşım
server.get('/static/*', restify.plugins.serveStatic({
  directory: './public',
  default: 'index.html'
}));

// web sayfayı kayd et
server.post(`/save/html/:theme`, function(req, res, next) {
  const theme = req.params.theme;
  blog.generate(theme, req.body, req.files).then(data => {
    return res.json(data)
  })
});

server.get('/blog/all', function(req, res, next) {
  try {
    blog.all(req.user.id).then(data => {
      return res.json(data)
    })
  } catch (e) {
    return res.json({
      code: 'error',
      message: e.message,
      data: []
    })
  }
});


server.get('/blog/by/:url', function(req, res, next) {
  const url = req.params.url;
  try {
    blog.getByUrl(url, req.user.id).then(data => {
      return res.json(data)
    })
  } catch (e) {
    return res.json({
      code: 'error',
      message: e.message,
      data: []
    })
  }
});

server.get('/blog/remove/:id/:url', function(req, res, next) {
  try {
    blog.remove(req.params.id, req.params.url).then(data => {
      return res.json(data)
    })
  } catch (e) {
    return res.json({
      code: 'error',
      message: e.message
    })
  }
});


// elasticsearch arama 
server.post(`/articles/search`, function(req, res, next) {
  let from = 0;
  let size = 10;
  if (req.body.from) {
    from = req.body.from;
  }
  if (req.body.size) {
    size = req.body.size;
  }
  const search = req.body.search;
  article.search(search, from, size).then(data => {
    return res.json(data)
  })
})

server.post(`/article/find`, function(req, res, next) {
  const id = req.body.id;
  const search = req.body.search;
  article.find(id, search).then(data => {
    return res.json(data)
  })
});


server.listen(config.port, function() {
    console.log('%s listening at %s', server.name, server.url);
});