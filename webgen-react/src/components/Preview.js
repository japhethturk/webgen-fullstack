import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogService } from '../service/BlogService'

export const Preview = () => {
    let { url } = useParams()
    const blogService = new BlogService()
    const [htmlString, setHtmlString] = useState('');
    

    useEffect(() => {
        if(url) {
            blogService.preview(url).then(response => {
                let html = response
                setHtmlString(html)
            })
        }
    }, [url])

    return (
        <div className="card">
            <div dangerouslySetInnerHTML={{__html: htmlString}} />
        </div>
    )
}
