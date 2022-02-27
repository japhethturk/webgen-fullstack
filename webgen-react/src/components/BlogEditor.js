import React, { useState, useEffect, useRef, useContext } from 'react';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import { InputText } from 'primereact/inputtext';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { ThemeChooser } from './layout/ThemeChooser';
import { OverlayPanel } from 'primereact/overlaypanel';
import { BlogService } from '../service/BlogService';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Dialog } from 'primereact/dialog';
import {Messages} from "primereact/messages";
import { ImageUploader } from './layout/ImageUploader';
import { Toast } from 'primereact/toast';
import { Functions } from '../util/Functions';
import { Menu } from 'primereact/menu';
import { Chips } from 'primereact/chips';
import { Paginator } from 'primereact/paginator';
import { InputTextarea } from 'primereact/inputtextarea';
import { Editor } from 'primereact/editor';
import StateContext from '../util/context/StateContext';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';

export const BlogEditor = () => {

    const {t} = useTranslation()
    const history = useHistory();
    const appState = useContext(StateContext);
    let { url } = useParams()
    const op = useRef(null)
    const menu = useRef(null)
    const toast = useRef(null)
    const childFunc = useRef(null)
    const messages = useRef(null)
    const [isEdit, setIsEdit] = useState(false)
    const [themes, setThemes] = useState([])
    const [selectedTheme, setSelectedTheme] = useState(null)
    const [siteUrl, setSiteUrl] = useState('')
    const [siteName, setSiteName] = useState('')
    const [tags, setTags] = useState([])
    const [siteDescription, setSiteDescription] = useState('')
    const [searchWord, setSearchWord] = useState('sevgi')
    const [searchResults, setSearchResults] = useState([])
    const [searchTotal, setSearchTotal] = useState(0)
    const [htmlString, setHtmlString] = useState('');
    const [themeIndexHtmlString, setThemeIndexHtmlString] = useState('')
    const [themeArticleCardHtmlString, setThemeArticleCardHtmlString] = useState('')
    const [themeOtherCardHtmlString, setThemeOtherCardHtmlString] = useState('')
    const [themeCssString, setThemeCssString] = useState('')
    const [loadTheme, setLoadTheme] = useState(false)
    const [dropArticle, setDropArticle] = useState({})
    const [dropOther, setDropOther] = useState(null)
    const [insertArticles, setInsertArticles] = useState([])
    const [otherArticles, setOtherArticles] = useState([])
    const [displayUploadDialog, setDisplayUploadDialog] = useState(false)
    const [displayEditdDialog, setDisplayEditDialog] = useState(false)
    const [displayTagsDialog, setDisplayTagsDialog] = useState(false)
    const [basicFirst, setBasicFirst] = useState(0)
    const [basicRows, setBasicRows] = useState(10)
    const [activeItemId, setActiveItemId] = useState(null)
    const [editArticleId, setEditArticleId] = useState('');
    const [editArticleType, setEditArticleIdType] = useState('');
    const [editArticleText, setEditArticleText] = useState('');
    const [editArticleName, setEditArticleName] = useState('');
    const dropIcon = `<div id="dropZoneIcon" style="text-align: center; margin:36%"><i class="pi pi-inbox p-mt-3 p-p-5" style="font-size: 10em; border-radius: 50%; background-color: var(--surface-b); color: var(--surface-d);"></i></div>`
    const dropIconMini = `<div id="dropIconMini" style="display: flex; justify-content: center; align-items: center; margin-top: 69px;"><i class="pi pi-inbox p-mt-3 p-p-5" style="font-size: 4em; border-radius: 50%; background-color: var(--surface-b); color: var(--surface-d);"></i></div>`
    const addTagIcon = `<div id="addTagIcon" style="cursor:pointer"><i class="pi pi-plus-circle p-mt-3 p-p-5" style="font-size: 2em; border-radius: 50%; background-color: var(--surface-b); color: var(--surface-d);"></i></div>`
    const blogService = new BlogService()


    useEffect(() => {
        blogService.themes().then(response =>{
            setSelectedTheme(response[0])
            setThemes(response)
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    

    useEffect(() => {
        if(url !== undefined && loadTheme) {
            setIsEdit(true)
            blogService.getByUrl(url, appState.admin.token).then(response => {
                if(response.code === "ok") {
                    let source = response.data._source
                    // console.log(source);
                    // setSiteName(source.name)
                    setSiteDescription(source.description)
                    setTags(source.tags)
                    setSiteUrl(source.url)
                    setInsertArticles(source.articles)
                    setOtherArticles(source.others)
                    
                    for(let tag of source.tags) {
                        addTag(tag)
                    }
                    for(let article of source.articles) {
                        dropedArticle(article.id, article.search, article.name, `${process.env.REACT_APP_STATIC}blogs/${source.url}/image/${article.image}`)
                    }
                    for(let article of source.others) {
                        droppedOther(article.id, article.search, article.name, `${process.env.REACT_APP_STATIC}blogs/${source.url}/image/${article.image}`)
                    }
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, loadTheme]);

    useEffect(()=> {
        // if(siteName !== '')
        // console.log({siteName, loadTheme});
        if(htmlString !== '')
            setHeaderTitle(siteName)
    }, [siteName, htmlString])

    useEffect(()=> {
        dropZoneIconChange()
    }, [insertArticles])

    useEffect(()=> {
        dropZoneMiniIconChange()
    }, [otherArticles])


    useEffect(()=>{
        if(searchWord.length > 2) {
            blogService.searchArticles(searchWord, basicFirst, basicRows, appState.admin.token).then(response=> {
                setSearchTotal(response.data.total)
                setSearchResults(response.data.hits)
            })
        } else {
            setSearchResults([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchWord, basicFirst])
    
    useEffect(()=>{
        op.current.hide();
        // console.log(selectedTheme);
        if(selectedTheme !== null) {
            // setSiteName(selectedTheme.name)
            blogService.theme(selectedTheme.key).then(
                axios.spread(({data: index_html}, {data:article_card}, {data:other_card}, {data:main_css}) => {
                    setThemeIndexHtmlString(index_html)
                    setThemeArticleCardHtmlString(article_card)
                    setThemeOtherCardHtmlString(other_card)
                    setThemeCssString(main_css)
                    setLoadTheme(true)
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[selectedTheme])

    useEffect(()=>{
        if(loadTheme){
            const dropArticlesZone = `<div id="dropZone" class="trow" style="width: 93%; min-height: 600px; margin: 0 25px; border: 1px solid #aaaaaa;">
            ${dropIcon}
            </div>`

            const dropOtherZone = `<ul id="dropZoneOther" class="trow" style="display: block;padding:0; width: 97%; min-height: 200px; border: 1px solid #aaaaaa;">${dropIconMini}</ul>`

            let htmlStringAll = themeIndexHtmlString.replace('##style##', `<style>${themeCssString}</style>`)
            .replace('##content-title##', t('articles'))
            .replace('##content##', dropArticlesZone)
            .replace('##other-articles##', dropOtherZone)
            .replaceAll('##tags##', `<li>${addTagIcon}</li>`)
            setHtmlString(htmlStringAll)
            setLoadTheme(false)
            let find = themes.find(item => item.name === siteName)
            if (find !== undefined || siteName === '') {
                setSiteName(selectedTheme.name)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[loadTheme])

    useEffect(()=>{
        if(htmlString !== '') {
            // if(siteName !== ''){
            //     setHeaderTitle(siteName)
            // }
            const dropZone = document.getElementById("dropZone")
            dropZone.ondrop = drop
            dropZone.ondragover = allowDrop

            const dropZoneOther = document.getElementById("dropZoneOther")
            dropZoneOther.ondrop = drop
            dropZoneOther.ondragover = allowDrop

            const addTagIcon = document.getElementById("addTagIcon")
            addTagIcon.onclick = () => {
                setDisplayTagsDialog(true)
            }

            for(let article of insertArticles) {
                dropedArticle(article.id, article.search, article.name, article.file.objectURL)
            }
            for(let article of otherArticles) {
                droppedOther(article.id, article.search, article.name, article.file.objectURL)
            }
            for(let tag of tags) {
                addTag(tag)
            }

            dropZoneIconChange()
            dropZoneMiniIconChange()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[htmlString])

    const dropZoneIconChange = () => {
        let dropZone = document.getElementById("dropZone")
        let dropZoneIcon = document.getElementById("dropZoneIcon")
        // console.log({dropZoneIcon, length: insertArticles.length});
        if (dropZone) {
            if(dropZoneIcon && insertArticles.length > 0){
                dropZoneIcon.remove()
                // dropZoneIcon.parentNode 
            } 
            
            if(!dropZoneIcon && insertArticles.length === 0) {
                var child = document.createElement('div');
                child.innerHTML = dropIcon;
                child = child.firstChild;
                dropZone.appendChild(child);
            }
        }
    }
    
    
    const dropZoneMiniIconChange = () => {
        let dropZoneOther = document.getElementById("dropZoneOther")
        let dropIconMini = document.getElementById("dropIconMini")
        if (dropZoneOther) {
            if(dropIconMini && otherArticles.length > 0){
                dropIconMini.remove()
            } 
            
            if(!dropIconMini && otherArticles.length === 0) {
                var child = document.createElement('div');
                child.innerHTML = dropIcon;
                child = child.firstChild;
                dropZoneOther.appendChild(child);
            }
        }
    }
    

    const setHeaderTitle = (name) => {
        const titleNode = document.getElementById("site-name")
        const footerNode = document.getElementById("site-footer-name")
        const urlNode = document.getElementById("site-url")
        
        // siteUrl
        if(titleNode){
            titleNode.innerHTML = name
        }
        if(footerNode){
            footerNode.innerHTML = name
        }
        if (urlNode) {
            let slug = `${Functions.slug(name)}`.replaceAll('-', '')
            let url = ''
            if (slug != '') {
                url = `${slug}.bilgisiburada.com`
            }
            setSiteUrl(url)
            urlNode.innerHTML = url
        }
    }

    const allowDrop = (e) => {
        e.preventDefault()
    }; 
      
    const drag = (e) => {
        e.dataTransfer.setData("text", e.target.id)
    }
      
    const drop = (e) => {
        e.preventDefault()
        setDropArticle(null)
        setDropOther(null)
        try {
            const data = e.dataTransfer.getData("text");
            const articleName = document.getElementById(data).innerHTML;
            const id = data.replace('drag-', '');
            if (document.getElementById("dropZoneOther").contains(e.target)) {
                setDropOther({
                    id,
                    name: articleName
                })
                setDisplayUploadDialog(true)
            } else {
                setDropArticle({
                    id,
                    name: articleName
                })
                let item = document.getElementById(`item-${id}`)
                
                if (item === null) {
                    setDisplayUploadDialog(true)
                } else {
                    let dropZoneIcon = document.getElementById("dropZoneIcon")
                    if (dropZoneIcon !== null) {
                        setDisplayUploadDialog(true)
                    } else { 
                        toast.current.show({severity: 'warn', summary: t('warning'), detail: t('article_already_exist')});
                    }
                }
            }
        } catch (error) {
            console.log(error.message);
            toast.current.show({severity: 'warn', summary: t('warning'), detail: t('please_drag_article')});
        }
    }
    

    let items = [
        {
            label:  t('edit'), 
            icon: 'pi pi-fw pi-pencil',
            command: () => {
                editItem(activeItemId);
            },
        },
        {
            label:  t('delete'), 
            icon: 'pi pi-fw pi-trash',
            command: () => {
                removeItem(activeItemId)
            },
        }
    ];

    const clickItem = (e, id) => {
        menu.current.toggle(e)
        setActiveItemId(id);
    }

    const editArticleSubmit = () => {
        if (editArticleType === 'item') {
            const matchingIndex = insertArticles.findIndex((item) => item.id === editArticleId)
            if (matchingIndex !== -1) {
                setInsertArticles(
                    insertArticles.map(item => 
                        item.id === editArticleId 
                        ? {...item, edit: editArticleText} 
                        : item 
                ))
            }
        } else {
            const matchingIndex = otherArticles.findIndex((item) => item.id === editArticleId)
            if (matchingIndex !== -1) {
                setOtherArticles(
                    otherArticles.map(item => 
                        item.id === editArticleId 
                        ? {...item, edit: editArticleText} 
                        : item 
                ))
            }
        }
        
        setDisplayEditDialog(false)
    }

    const editItem = (itemId) => {
        let thisItem = document.getElementById(itemId)
        let dataSearch = thisItem.getAttribute('data-search')
        var thisId = ''
        var type = 'item'
        var findArticle = {}
        if (itemId.includes('item')) {
            thisId = itemId.replace('item-', '')
            findArticle = insertArticles.find((item) =>  `${item.id}` === thisId);
        } else {
            thisId = itemId.replace('other-', '')
            type = 'other'
            findArticle = otherArticles.find((item) =>  `${item.id}` === thisId);
        }
        if (findArticle.edit) {
            setEditArticleText(findArticle.edit)
            setEditArticleName(findArticle.name)
            setEditArticleId(thisId)
            setEditArticleIdType(type)
            setDisplayEditDialog(true)
        } else {
            blogService.getArticle(thisId, dataSearch, appState.admin.token).then(response => {
                let source = response.data
                // console.log(response);
                // console.log(source.description.length);
                // console.log("--------------------------------------------------");
                // console.log(source.short_description.length);
                // let articleText = ""
                // if(source.description.length > 100) {
                //     articleText = source.description.replaceAll('src="/Image/', 'src="https://g.fmanager.net/Image/')
                // } else {
                //     articleText = source.short_description.replaceAll('src="/Image/', 'src="https://g.fmanager.net/Image/')
                // }
                let articleText = source.description
                setEditArticleText(articleText)
                setEditArticleName(source.name)
                setEditArticleId(thisId)
                setEditArticleIdType(type)
                setEditArticleId(thisId)
                setDisplayEditDialog(true)
            })
        }
    }

    const removeItem = (itemId) => {
        let item = document.getElementById(itemId)
        item.parentNode.remove()
        if (itemId.includes('item')) {
            const thisId = itemId.replace('item-', '')
            let unRemoved = insertArticles.filter((item) => item.id !== thisId);
            setInsertArticles(unRemoved)
        } else {
            const thisId = itemId.replace('other-', '')
            let unRemoved = otherArticles.filter((item) => item.id !== thisId);
            setOtherArticles(unRemoved)
        }
    }
    
    const loadImage = (file) => {
        if(file === null) {
            toast.current.show({severity: 'warn', summary: t('warning'), detail: t('you_must_select_photo')});
        } else {
            if (dropArticle) {
                let article = {
                    id: dropArticle.id,
                    name: dropArticle.name,
                    search: searchWord,
                    file: file
                }
                setInsertArticles(oldArray => [...oldArray, article]);
                dropedArticle(dropArticle.id, searchWord, dropArticle.name, file.objectURL)
                setDropArticle(null)
            } else if (dropOther) {
                let article = {
                    id: dropOther.id,
                    name: dropOther.name,
                    search: searchWord,
                    file: file
                }
                setOtherArticles(oldArray => [...oldArray, article]);
                droppedOther(dropOther.id, searchWord, dropOther.name, file.objectURL)
                setDropArticle(null)
            }
        }
    }

    const dropedArticle = (id, searchWord, name, imageUrl) => {
        const itemId = `item-${id}`
        const data = `data-search="${searchWord}"`
        let articleWithVariable = themeArticleCardHtmlString.replaceAll('##article_name##', name)
        .replace('##article_image##', imageUrl)
        .replace('href="##article_href##"', `id="${itemId}" ${data}`);

        let child = document.createElement('div');
        child.innerHTML = articleWithVariable;
        child = child.firstChild;
        let dropZone = document.getElementById("dropZone");
        dropZone.appendChild(child);
        setDisplayUploadDialog(false)
        const item = document.getElementById(itemId)
        item.addEventListener('click', function(e){ clickItem(e, itemId);}, false)
    }

    const droppedOther = (id, searchWord, name, imageUrl) => {
        const itemId = `other-${id}`
        const data = `data-search="${searchWord}"`
        let articleWithVariable = themeOtherCardHtmlString.replaceAll('##article_name##', name)
        .replace('##article_image##', imageUrl)
        .replace('href="##article_href##"', `id="${itemId}" ${data}`);

        let child = document.createElement('div');
        child.innerHTML = articleWithVariable;
        child = child.firstChild;
        var dropZoneOther = document.getElementById("dropZoneOther");
        dropZoneOther.appendChild(child);
        setDisplayUploadDialog(false)
        let item = document.getElementById(itemId)
        item.addEventListener('click', function(e){ clickItem(e, itemId);}, false);
    }

    const generateHtml = (e) => {
        let postable = true;
        
        if(siteName.length <= 2) {
            toast.current.show({severity: 'warn', summary: t('warning'), detail: t('you_must_enter_blog_name')});
            postable = false;
        }

        // console.log(siteName === selectedTheme.name);
        if(siteName === selectedTheme.name) {
            toast.current.show({severity: 'warn', summary: t('warning'), detail: t('you_must_enter_different_name')});
            postable = false;
        }

        if(tags.length === 0){
            toast.current.show({severity: 'warn', summary: t('warning'), detail: t('you_must_enter_tags')});
            postable = false;
        }

        if(siteDescription === "") {
            toast.current.show({severity: 'warn', summary: t('warning'), detail: t('you_must_enter_description')});
            postable = false;
        }

        

        if(postable) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            let formData = new FormData()
            let articles = [];
            let others = [];
            insertArticles.forEach(article => {
                articles.push({
                    id: article.id, 
                    name: article.name,
                    search: article.search,
                    slug: Functions.slug(article.name.substring(0, 30)),
                    image: article.file ? article.file.name : article.image,
                    edit: article.edit
                })
                formData.append(`${article.id}_image`, article.file)
            });

            otherArticles.forEach(article => {
                others.push({
                    id: article.id, 
                    name: article.name,
                    search: article.search,
                    slug: Functions.slug(article.name.substring(0, 30)),
                    image: article.file ? article.file.name : article.image,
                    edit: article.edit
                })
                formData.append(`${article.id}_other_image`, article.file)
            });

            let data = {
                user_id: appState.admin.id,
                name: siteName,
                url: siteUrl,
                articles,
                others,
                description: siteDescription,
                tags,
                theme: selectedTheme.key
            }
            
            formData.append(`data`, JSON.stringify(data))
            
            blogService.generateWeb(formData, selectedTheme.key, appState.admin.token).then(response => {
                if (response.code === "ok") {
                    messages.current.show([{sticky: true, severity: 'success', summary: t('success'), detail: t('success_generate_message')}]);
                } else if (response.code === "Unauthorized"){
                    messages.current.show([{severity: 'warn', summary: t('warn'), detail: t('unexpected_response')}]);
                } else {
                    messages.current.show([{severity: 'error', summary: t('error'), detail: t('occurred_connecting_error')}]);
                }
            })
        }
        e.preventDefault();
    }

    const renderUploadFooter = () => {
        return (
            <div>
                <Button label={t('give_up')} icon="pi pi-times" onClick={() => setDisplayUploadDialog(false)} className="p-button-text" />
                <Button label={t('approve')} icon="pi pi-check"  onClick={() => childFunc.current()} autoFocus />
            </div>
        );
    }

    const renderEditFooter = () => {
        return (
            <div>
                <Button label={t('give_up')} icon="pi pi-times" onClick={() => setDisplayEditDialog(false)} className="p-button-text" />
                <Button label={t('approve')} icon="pi pi-check"  onClick={() => editArticleSubmit()} autoFocus />
            </div>
        );
    }

    const onBasicPageChange = (event) => {
        setBasicFirst(event.first);
        setBasicRows(event.rows);
    }

    const removeTag = (valueArr) => {
        const value = valueArr[0]
        const tagNode =  document.getElementById(Functions.slug(value))
        if(tagNode !== undefined) {
            tagNode.remove()
        }
    }

    const addTag = (value) => {
        try {
            var child = document.createElement('div');
            child.innerHTML = `<li id="${Functions.slug(value)}"><a>${value}</a></li>`
            child = child.firstChild;
            console.log(document.getElementById("tags"));
            document.getElementById("tags").appendChild(child)
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="grid table-demo">
            <div className="col-12">

                <Toast ref={toast}></Toast>

                <Messages ref={messages}/>

                <Dialog header={editArticleName} visible={displayEditdDialog} breakpoints={{'960px': '75vw'}} style={{width: '70vw'}} footer={renderEditFooter()} onHide={() => setDisplayEditDialog(false)}>
                    <Editor style={{ height: '320px' }} value={editArticleText} onTextChange={(e) => setEditArticleText(e.htmlValue)} />
                </Dialog>

                <Dialog header={t('image_for_article')} visible={displayUploadDialog} breakpoints={{'960px': '75vw'}} style={{width: '50vw'}} footer={renderUploadFooter()} onHide={() => setDisplayUploadDialog(false)}>
                   <ImageUploader loadImage={file => loadImage(file)} childFunc={childFunc} />
                </Dialog>

                <Dialog header={t('add_tags')} visible={displayTagsDialog} breakpoints={{'960px': '75vw'}} style={{width: '50vw'}} onHide={() => setDisplayTagsDialog(false)}>
                    <Chips style={{width:"100%"}} placeholder={t("tags")} value={tags} onChange={(e) => setTags(e.value)} onRemove={(e)=>removeTag(e.value)} onAdd={(e)=>addTag(e.value)}  separator="," />
                </Dialog>
                
                <OverlayPanel ref={op} showCloseIcon id="overlay_panel" style={{width: '70%'}} className="overlaypanel-demo">
                    <ThemeChooser options={themes} value={selectedTheme} onChange={(item) => setSelectedTheme(item)}/>
                </OverlayPanel>

                <div className="card">
                        <div className="flex align-items-center justify-content-between mb-0 pb-0 mb-3">
                            <Button icon="pi pi-arrow-left" className="p-button-rounded p-button-outlined" onClick={()=> history.goBack()}/>
                            <h4 className="m-0">{t('blog_editor')}</h4>
                            <Button label={t('generate')} icon="pi pi-save" iconPos="right" className="p-button-text" onClick={(e) => generateHtml(e)}/>
                        </div>
                        <Splitter style={{height: '100%'}} className="p-mb-5">
                            <SplitterPanel size={25} className="p-d-flex p-ai-center p-jc-center">
                                <div className="grid p-fluid" style={{padding:10}}>
                                    <div className="col-12">
                                        <label style={{marginBottom:10}}>{t('choose_theme')}</label>
                                        {
                                            selectedTheme ?
                                            <div className="theme-item " onClick={(e) => op.current.toggle(e)}>
                                                <img style={{width:"100%"}} alt="Logo" src={`http://144.91.85.117:8080/static/themes/${selectedTheme.key}/assets/preview.jpg`}
                                                onError={(e) => e.target.src='assets/layout/images/empty.png'} />
                                                <h5 style={{textAlign:"center"}}>{selectedTheme.name}</h5>
                                            </div> :
                                            <></>
                                        }
                                    </div>
                                    <div className="col-12">
                                        <span className="p-input-icon-left">
                                            <i className="pi pi-globe"/>
                                            <InputText value={siteName} onChange={(e)=> setSiteName(Functions.trimString(e.target.value))} type="text" placeholder={t('blog_name')}/>
                                        </span>
                                    </div>
                                    <div className="col-12">
                                        <span className={searchWord === '' ? "p-input-icon-left" : "p-input-icon-left p-input-icon-right"}>
                                            <i className="pi pi-search"/>
                                            <InputText value={searchWord} onChange={(e) => setSearchWord(e.target.value)} type="text" placeholder={t('blog_content_search')}/>
                                            {
                                                searchWord === '' ? <></> :
                                                    <i onClick={()=> {setSearchWord('')}} className="pi pi-times"/>
                                            }

                                        </span>
                                    </div>

                                    <div className="col-12" style={{padding:0}}>
                                        {
                                            searchResults.map((item, index) => {
                                                return  <div key={index} className='draggable'  draggable="true" onDragStart={event => drag(event)} id={`drag-${item._source.id}`} >
                                                            {item._source.name}
                                                        </div>
                                            })
                                        }
                                        <Paginator className='webgen-paginate' pageLinkSize={2} first={basicFirst} rows={basicRows} totalRecords={searchTotal} onPageChange={onBasicPageChange}></Paginator>
                                    </div>
                                    
                                    <div className="col-12">
                                        <Chips style={{width:"100%"}} placeholder={t("tags")} value={tags} onChange={(e) => setTags(e.value)} onRemove={(e)=>removeTag(e.value)} onAdd={(e)=>addTag(e.value)}  separator="," />
                                    </div>
                                    <div className="col-12">
                                        <InputTextarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={5} cols={30} autoResize placeholder={t('description')} />
                                    </div>
                                </div>
                            </SplitterPanel>
                            <SplitterPanel size={75} className='htmlContent'>
                                <Menu model={items} popup ref={menu} id="popup_menu" />

                                <div dangerouslySetInnerHTML={{__html: htmlString}} />
                            </SplitterPanel>
                        </Splitter>
                </div>
            </div>

        </div>
    )
}
