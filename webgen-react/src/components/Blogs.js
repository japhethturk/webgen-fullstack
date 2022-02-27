import React, { useState, useEffect, useContext, useRef } from 'react';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import { DataTable } from 'primereact/datatable';
import {Messages} from "primereact/messages";
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { BlogService } from '../service/BlogService';
import StateContext from '../util/context/StateContext';
import { SplitButton } from 'primereact/splitbutton';

export const Blogs = () => {

    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState(null);
    const history = useHistory();
    const blogService = new BlogService()
    const appState = useContext(StateContext);
    const messages = useRef(null)

    const {t} = useTranslation()

    const items = (rowData) => {
        return [
            {
                label: t('edit'),
                icon: 'pi pi-pencil',
                command: () => {
                    history.push(`/blog/edit/${rowData._source.url}`)
                }
            },
            {
                label: t('delete'),
                icon: 'pi pi-times',
                command: () => {
                    remove(rowData)
                }
            },
            {
                label: t('preview'),
                icon: 'pi pi-external-link',
                command: () => {
                    if(rowData._source.isDraft) {
                        const win = window.open(`${process.env.REACT_APP_STATIC}blogs/${rowData._source.url}/index.html`, "_blank");
                        win.focus();
                    } else {
                        console.log("external");
                    }
                }
            }
        ];
    }

    useEffect(() => {
        setLoading(true)
        blogService.all(appState.admin.token).then(response => {
            if (response.code === "ok") {
                setBlogs(response.data)
            }
        }).finally(()=> setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const edit = (rowData) => {
        history.push(`/blog/edit/${rowData._source.url}`)
    }


    const remove = (rowData) => {
        blogService.remove(rowData._source.id, rowData._source.url, appState.admin.token).then(response => {
            if(response.code === "ok") {
                let unRemoved = blogs.filter(function (item) {
                    return item._source.id !== rowData._source.id;
                })
                setBlogs(unRemoved)
            }
        });
    }
    

    const viewDraft = (rowData) => {
        const win = window.open(`${process.env.REACT_APP_STATIC}blogs/${rowData._source.url}/index.html`, "_blank");
        win.focus();
    }
    

    const actionTemplate = (rowData) => {
        return (
            <React.Fragment>
                {
                    rowData._source.isDraft ? 
                    <SplitButton label={t('publish')} icon="pi pi-check" className="p-button-text p-button-success" onClick={edit} model={items(rowData)} /> :
                    <SplitButton label={t('edit')} icon="pi pi-pencil" onClick={edit(rowData)} model={items(rowData)} />
                }
                
                {/* {
                     rowData._source.isDraft ? <Button label={t('publish')} className="p-button-text p-button-success" icon="pi pi-check" iconPos="right" />
                      : <span></span>
                }
                <Button label={t('edit')} icon="pi pi-pencil" className="p-button-text" onClick={(e)=>{edit(rowData)}} /> */
                }
            </React.Fragment>
        );
    };
    
    
    const draftTemplate = (rowData) => {
        return rowData._source.isDraft ? 
        <Button label={t('draft')} onClick={() => viewDraft(rowData)} icon="pi pi-eye" className="p-button-outlined p-button-warning" /> : 
        <Button label={t('public')} icon="pi pi-eye" />
        // return rowData._source.isDraft ? <span style={{background:"#feedaf", color:"#8a5340"}}>{t('draft')}</span> : <span style={{background:"#c8e6c9", color:"#256029"}}>{t('public')}</span>
    }

    return (
        <div className="grid table-demo">
            <div className="col-12">
                <div className="card">
                    <Messages ref={messages}/>

                    <div className="flex align-items-center justify-content-between mb-0 pb-0 mb-3">
                        <h4 className="m-0">{t('my_blogs')}</h4>
                        <Button label={t('generate_new_blog')} icon="pi pi-plus" iconPos="right" className="p-button-text" onClick={(e) => history.push('/blog/add')}/>
                    </div>

                    <div className="datatable-responsive">
                        <DataTable value={blogs} responsiveLayout="scroll" emptyMessage={t('no_records_found')} loading={loading}>
                            <Column field="_source.url" header={t('blog')}></Column>
                            <Column field="_source.description" header={t('description')}></Column>
                            <Column field="_source.isDraft" header={t('status')} body={draftTemplate}></Column>
                            <Column header={t("operation")} body={actionTemplate}  style={{width: 100}}/>
                        </DataTable>  
                    </div>
                </div>
            </div>
           
        </div>
    )
}
