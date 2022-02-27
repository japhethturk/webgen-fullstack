"use strict";

const axios = require('axios');
const bcrypt = require('bcrypt');
const config = require('./../config.json');

// exports.authenticate = (email, password) => {
//     return Promise.resolve({ uid: 1, name: 'Sean', admin: false });
// };


// admin@admin.com
// testpass

exports.authenticate = (email, password) => {  
  return new Promise((resolve, reject) => {
    const query = {
      // "_source": [
      //   "id",
      //   "role",
      //   "email",
      //   "password"
      //   ],
        "query":{
          "bool": {
          "must": [
            { "match_phrase": { "email": email}}
          ]
          }
        }
    }

    axios(`${config.elasticsearch_url}users/_search?filter_path=hits.hits._source&source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
      if (response.data.hits !== undefined) {
        const user = response.data.hits.hits[0]._source
        if (user && bcrypt.compareSync(password, user.password)) {
          resolve(user);
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });

  });
};


exports.all = () => {
  return new Promise((resolve, reject) => {
    const query = {
          "_source": [
            "id",
            "role",
            "email"
            ],
            "query":{
              "bool": {
              "must_not": [
                { "match_phrase": { "role": "admin"}}
              ]
              }
            }
        }

    axios(`${config.elasticsearch_url}users/_search?filter_path=hits.hits._source&source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
      if (response.data.hits !== undefined) {
        const users = response.data.hits.hits
        if (users) {
          resolve({
            code: "ok",
            users
          });
        } else {
          resolve({
            code: "not-found",
            message: {severity: "error", summary: "Hata", detail:"Sonuç bulunamadı.", sticky: true}
          });
        }
      } else {
        resolve({
          code: "error",
          message: {severity: "error", summary: "Hata", detail:"Veri tabanına bağlanırken hata oluşdu.", sticky: true}
        });
      }
    });

  });
}

exports.add = (id, email, password, role) => {
  return new Promise((resolve, reject) => {

    const query = {
      "_source": [
        "id",
        "role",
        "email",
        "password"
        ],
        "query":{
          "bool": {
          "must": [
            { "match_phrase": { "email": email}}
          ]
          }
        }
    }

    axios(`${config.elasticsearch_url}users/_search?filter_path=hits.hits._source&source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
      if (response.data.hits !== undefined) {
        resolve({
          code: 'exist'
        })
      } else {
        const encrypted =  bcrypt.hashSync(password, 10);
        const user = { 
          "id": id,
          "email": email,
          "password": encrypted,
          "role": "editor",
          // "websites": []
        }
        const json = JSON.stringify(user);
        axios.post(`${config.elasticsearch_url}users/document/${id}`, json, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((response) => {
          resolve({
            code: 'ok',
            data: user,
          })
        }).catch((e)=> {
          resolve({
            code: 'error',
            message: e.response
          })
        });
      }
    });

  })
}


exports.edit = (data) => {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(data);
    axios.put(`${config.elasticsearch_url}users/document/${data.id}`, json, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      resolve({
        code: 'ok',
      })
    }).catch((e)=> {
      resolve({
        code: 'error',
        message: e.response
      })
    });
  })
}


exports.remove = (id) => {
  return new Promise((resolve, reject) => {
    axios.delete(`${config.elasticsearch_url}users/document/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      resolve({
        code: 'ok',
      })
    }).catch((e)=> {
      resolve({
        code: 'error',
        message: e.response
      })
    });
  })
}

// exports.authenticate = (username, password) => {  
//   return new Promise((resolve, reject) => {
//     db.findOne({username, password}, (err, data) => {
//       if (err) return reject(err);
//       resolve(data); // {uid: 1, name: Sean, admin: false}
//     });
//   });
// };


exports.getByMail = (email) => {
  return new Promise((resolve, reject) => {
    const query = {
      "query":{
        "bool": {
        "must": [
          { "match_phrase": { "email": email}}
        ]
        }
      }
    }
    axios(`${config.elasticsearch_url}users/_search?filter_path=hits.hits._source&source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
      if (response.data.hits !== undefined) {
        resolve(response.data.hits.hits[0]._source)
      } else {
        resolve(false)
      }
    });
  })
}



// https://medium.com/sean3z/json-web-tokens-jwt-with-restify-bfe5c4907e3c