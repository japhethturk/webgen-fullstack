"use strict";

const axios = require('axios');
const config = require('./../config.json');


exports.search = (search, from, size) => {
    // 6 Makaleler
    // 50 Kısa filmler - Mutlaka izleyin
    // 2 HD Belgeseller
    // 60 Belgesellerden Seçme Bölümler
    return new Promise((resolve, reject) => {
        const query = {
          "_source": [
            "id",
            "name",
            "object_categories.category_id,id"
          ],
          "from" : from, "size" : size,
            "query":{
              "bool": {
              "must": [
                { "term": { "language":   1}},
                { "term": { "type_id": 6 }},
                { "match_phrase_prefix": { "name": search }},
                { "match_phrase_prefix": { "short_description": search }}
              ],
              }
            }
        }
      
        try {
            axios(`${config.elasticsearch_url}apiv3/_search?source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
              if (response.data.hits !== undefined) {
                return resolve({
                  code:"ok",
                  data: response.data.hits
                  // data: response.data.hits.hits
                })
              } else {
                return resolve({
                  code:"not-found",
                  data:[]
                })
              }
            });
        } catch (err) {
            return resolve({
                code:"error",
                error: err,
                data:[]
              })
        }
    });
}


exports.find = (id, search) => {
    return new Promise((resolve, reject) => {
        const query = {
            "_source": [
              "id",
              "name",
              "picture",
              "short_description",
              "description",
              "search_meta_keys",
              "search_meta_description",
              "object_categories.category_id,id"
              ],
              "query":{
                "bool": {
                "must": [
                    { "term": { "id": id}},
                    { "match_phrase_prefix": { "name": search }},
                    { "match_phrase_prefix": { "short_description": search }}
                  ]
                }
              }
          }
        try {
            axios(`${config.elasticsearch_url}apiv3/_search?filter_path=hits.hits._source&source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
              if (response.data.hits !== undefined) {
                  let source = response.data.hits.hits[0]._source
                  let articleText = ""
                  if (source.description) {
                    if(source.description.length > 200) {
                        articleText = source.description.replaceAll('src="/Image/', 'src="https://g.fmanager.net/Image/')
                    } else {
                        articleText = source.short_description.replaceAll('src="/Image/', 'src="https://g.fmanager.net/Image/')
                    }
                  } else {
                      articleText = source.short_description.replaceAll('src="/Image/', 'src="https://g.fmanager.net/Image/')
                  }
                  source.description = articleText
                  delete source.short_description
                return resolve({
                  code:"ok",
                  data: source
                })
              } else {
                return resolve({
                  code:"not-found",
                  data:[]
                })
              }
            });
        } catch (err) {
            next(err)
        }
    });
}