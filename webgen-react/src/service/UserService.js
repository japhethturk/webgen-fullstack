import axios from 'axios'
import {Functions} from '../util/Functions';

export class UserService {


    login(requestBody) {
        return axios.post(`${process.env.REACT_APP_API}auth`, requestBody, Functions.axiosJsonHeader()).then(res => res.data);
    }

    checkToken(token) {
        return axios.post(`${process.env.REACT_APP_API}checkToken`, {}, Functions.axiosJsonTokenHeader(token)).then(res => res.data);
    }

    update(requestBody, id, token) {
        return axios.post(`${process.env.REACT_APP_API}user/edit/id/${id}`, requestBody, Functions.axiosJsonTokenHeader(token)).then(res => res.data);
    }
    
    all(token) {
        return axios.get(`${process.env.REACT_APP_API}user/all`, Functions.axiosTokenHeader(token)).then(res => res.data);
    }

    add(requestBody, token) {
        return axios.post(`${process.env.REACT_APP_API}user/add`, requestBody, Functions.axiosJsonTokenHeader(token)).then(res => res.data);
    }

    remove(id, token){
        return axios.get(`${process.env.REACT_APP_API}user/remove/id/${id}`, Functions.axiosTokenHeader(token)).then(res => res.data);
    }

}
