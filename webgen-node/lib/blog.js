"use strict";

const axios = require('axios');
const config = require('../config.json');
const articleLib = require('./article');
const fse = require('fs-extra');
const fs = require('fs');
var rimraf = require("rimraf");

exports.generate = (theme, body, files) => { 
    return new Promise((resolve, reject) => {
        const siteData = JSON.parse(body['data'])
        let keywords = '';
        
        let endpoints = [
            `${config.app_url}static/themes/${theme}/index.html`,
            `${config.app_url}static/themes/${theme}/article_card.html`,
            `${config.app_url}static/themes/${theme}/other_card.html`,
            `${config.app_url}static/themes/${theme}/assets/main.css`
        ];
    
        axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
        axios.spread(({data: index}, {data:article_card}, {data:other_card}, {data:main_css}) => {
            let otherCards = '';
            for (let article of  siteData.others) {
                let thisArticleCard = other_card.replaceAll('##article_href##', `sayfa/${article.slug}.html`)
                    .replace('##article_image##', `image/${article.image}`)
                    .replaceAll('##article_name##', `${article.name}`);
                    otherCards = `${otherCards}
                ${thisArticleCard}`;
            }
    
            let otherCardsPage = '';
            for (let article of  siteData.others) {
                let thisArticleCard = other_card.replaceAll('##article_href##', `${article.slug}.html`)
                    .replace('##article_image##', `../image/${article.image}`)
                    .replaceAll('##article_name##', `${article.name}`);
                    otherCardsPage = `${otherCardsPage}
                ${thisArticleCard}`;
            }
    
            let tags = '';
            for (let tag of siteData.tags) {
                keywords = `${keywords}${tag}, `
                tags = `${tags}<li><a href="#">${tag}</a></li>`
            }
            keywords = keywords.substring(0, keywords.length - 2)

            for (let article of  siteData.others) {
                createArticlePage(index, article, siteData.name, siteData.url, tags, keywords, otherCardsPage)
            }

            let articleCards = '';
            for (let article of  siteData.articles) {
                let thisArticleCard = article_card.replaceAll('##article_href##', `sayfa/${article.slug}.html`)
                    .replace('##article_image##', `image/${article.image}`)
                    .replaceAll('##article_name##', `${article.name}`);
                    
                articleCards = `${articleCards}
                ${thisArticleCard}`;

                createArticlePage(index, article, siteData.name, siteData.url, tags, keywords, otherCardsPage)
            }
            
            let indexHtml = index.replaceAll('##title##', siteData.name)
            .replace('##style##', '<link href="assets/main.css" rel="stylesheet">')
            .replaceAll('##main-url##', 'index.html')
            .replaceAll('##description##', siteData.description)
            .replaceAll('##keywords##', keywords)
            .replaceAll('##tags##', tags)
            .replaceAll('##site-url##', siteData.url)
            .replace('##content-title##', 'Makaleler')
            .replace('##content##', `<div class="row">${articleCards}</div>`)
            .replace('##other-articles##', `<div class="row"><ul>${otherCards}</ul></div>`);

            // index.html olustur
            var file = `./public/static/blogs/${siteData.url}/index.html`
            fse.outputFile(file, indexHtml, function (err) {
                if (err !== null) {
                    console.log(err);
                }
            });

            // main.css olustur
            var file = `./public/static/blogs/${siteData.url}/assets/main.css`
            fse.outputFile(file, main_css, function (err) {
                if (err !== null) {
                    console.log(err);
                }
            });
        })
        );
        
        try {
            let dir = `./public/static/blogs/${siteData.url}/image/`
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, {recursive: true})
            }
            for (var key in files) {
                if (files.hasOwnProperty(key)) {
                    fs.renameSync(files[key].path, `${dir}${files[key].name}`);
                    fs.unlink(files[key].path, () => {});
                }
            }
            
            let dataElastic = {
                id: getHash(siteData.url),
                theme: siteData.theme,
                isDraft: true,
                user_id: siteData.user_id,
                name: siteData.name,
                url: siteData.url,
                tags: siteData.tags,
                description: siteData.description,
                articles: siteData.articles,
                others: siteData.others,
                timestamp: Date.now()
            }


            const json = JSON.stringify(dataElastic);
            axios.put(`${config.elasticsearch_url}blogs/document/${dataElastic.id}`, json, {
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
        } catch (e){
            return resolve({
                code: 'error',
                message: e.message,
            })
        }
    });
}

const createArticlePage = (html, article, siteName, siteUrl, tags, keywords, otherCardsPage) => {
    articleLib.find(article.id, article.search).then(response => {
      try {
        const thisArticle = response.data;
        let thisArticleContent = article.edit !== undefined  ? article.edit : thisArticle.description
        let pageHtml = html.replaceAll('##title##', siteName)
        .replace('##style##', '<link href="../assets/main.css" rel="stylesheet">')
        .replaceAll('##main-url##', '../index.html')
        .replace('##description##', escapeHtml(thisArticleContent).substring(0, 255))
        .replaceAll('##keywords##', keywords)
        .replaceAll('##tags##', tags)
        .replaceAll('##site-url##', siteUrl)
        .replace('##content-title##', article.name)
        .replace('##content##', `<div class="row">${thisArticleContent.replaceAll('src="/Image/', 'src="https://g.     fmanager.net/Image/')}</div>`)
          .replace('##other-articles##', `<div class="row"><ul>${otherCardsPage}</ul></div>`);
          var file = `./public/static/blogs/${siteUrl}/sayfa/${article.slug}.html`
          // iç sayfaları oluştur
          fse.outputFile(file, pageHtml, function (err) {
              if (err !== null) {
                  console.log(err);
              }
          });
        } catch (error) {
          console.log(error);
        }
      })
  
    
}

const escapeHtml = (htmlString) => {
  try {
    
    return htmlString.replace(/<[^>]+>/g, '')
    .replaceAll('&nbsp;',' ')
    .replaceAll('&rsquo;', ' ')
    .replaceAll('&ldquo;', ' ')
    .replaceAll('&rdquo;', ' ')
    .replaceAll('&amp;','')
    .replaceAll('&#39;',"'")
    .replaceAll('  '," ")
    .replace(/(\r\n|\n|\r)/gm, "");
  } catch (error) {
    return htmlString;
  }
}


const getHash = (input) => {
    var hash = 0, len = input.length;
    for (var i = 0; i < len; i++) {
        hash  = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0; // to 32bit integer
    }
    return hash;
}


exports.all = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = {
            "_source": [
              "id",
              "isDraft",
              "url",
              "slug",
              "description"
            ],
            "query":{
                "bool": {
                "must": [
                  { 
                    "match_phrase": { "user_id": user_id}
                  }
                ]
                }
            }
        }
        

        axios(`${config.elasticsearch_url}blogs/_search?filter_path=hits.hits._source&source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
            if (response.data.hits !== undefined) {
              const blogs = response.data.hits.hits
              if (blogs) {
                resolve({
                  code: "ok",
                  data: blogs
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


exports.getByUrl = (url, user_id) => {
    return new Promise((resolve, reject) => {
        const query = {
            "query":{
                "bool": {
                "must": [
                    { "match_phrase": { "user_id": user_id }},
                    { "match_phrase": { "url": url }}
                  ]
                }
            }
        }

        axios(`${config.elasticsearch_url}blogs/_search?filter_path=hits.hits._source&source_content_type=application/json&source=${JSON.stringify(query)}`).then(response => {
            if (response.data.hits !== undefined) {
              if (response.data.hits !== undefined) {
                return resolve({
                  code:"ok",
                  data: response.data.hits.hits[0]
                })
              } else {
                return resolve({
                  code:"not-found",
                  data:[]
                })
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



exports.remove = (id, url) => {
  return new Promise((resolve, reject) => {
    try {
      axios.delete(`${config.elasticsearch_url}blogs/document/${id}`).then((response) => {
        if (response.data.result === 'deleted') {
          rimraf(`./public/static/blogs/${url}`, function () { 
            resolve({
              code: 'ok',
            })
          });
        } else {
          resolve({
            code: 'unsuccess',
          })
        }
      }).catch((e)=> {
        resolve({
          code: 'error',
          message: e.response
        })
      });
    } catch (e){
        return resolve({
            code: 'error',
            message: e.message,
        })
    }
  });
  
}