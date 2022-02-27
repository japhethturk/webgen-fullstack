import axios from 'axios';
import {Functions} from '../util/Functions'

export class BlogService {
    

    searchArticles(search, from, size, token) {
        let requestBody = {
            search,
            from,
            size
        }
        return axios.post(`${process.env.REACT_APP_API}articles/search`, requestBody, Functions.axiosJsonTokenHeader(token))
            .then(res => res.data);
    }
    
    getArticle(id, search, token) {
        let requestBody = {
            id,
            search
        }
        return axios.post(`${process.env.REACT_APP_API}article/find`, requestBody, Functions.axiosTokenHeader(token)).then(res => res.data);
    }

    themes() {
        return axios.get(`${process.env.REACT_APP_STATIC}themes/themes.json`)
            .then(res => res.data.data);
    }

    theme(name) {
        let endpoints = [
            `${process.env.REACT_APP_STATIC}themes/${name}/index.html`,
            `${process.env.REACT_APP_STATIC}themes/${name}/article_card.html`,
            `${process.env.REACT_APP_STATIC}themes/${name}/other_card.html`,
            `${process.env.REACT_APP_STATIC}themes/${name}/assets/main.css`
          ];

        return axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
    }
    
    themeHtml(theme) {
        return axios.get(`${process.env.REACT_APP_STATIC}themes/${theme}/index.html`).then(res => res.data);
    }

    themeArticleCardHtml(theme) {
        return axios.get(`${process.env.REACT_APP_STATIC}themes/${theme}/article_card.html`).then(res => res.data);
    }

    themeArticleSuggestedCardHtml(theme) {
        return axios.get(`${process.env.REACT_APP_STATIC}themes/${theme}/other_card.html`)
            .then(res => res.data);
    }

    themeCss(theme) {
        return axios.get(`${process.env.REACT_APP_STATIC}themes/${theme}/assets/main.css`).then(res => res.data);
    }

    generateWeb(requestBody, theme, token) {
        return axios.post(`${process.env.REACT_APP_API}save/html/${theme}`, requestBody, Functions.axiosMultipartHeaderToken(token)).then((res) => res.data);
    }

    storeImage(requestBody, token) {
        return axios.post(`${process.env.REACT_APP_API}image/store`, requestBody, Functions.axiosMultipartHeaderToken(token)).then((res) => res.data);
    }
    
    all(token) {
        return axios.get(`${process.env.REACT_APP_API}blog/all`, Functions.axiosTokenHeader(token)).then(res => res.data);
    }

    getByUrl(url, token) {
        return axios.get(`${process.env.REACT_APP_API}blog/by/${url}`, Functions.axiosTokenHeader(token)).then(res => res.data);
    }

    remove(id, url, token) {
        return axios.get(`${process.env.REACT_APP_API}blog/remove/${id}/${url}`, Functions.axiosTokenHeader(token)).then(res => res.data);
    }

    preview(url) {
        return axios.get(`${process.env.REACT_APP_STATIC}blogs/${url}/index.html`).then(res => res.data);
    }

}
