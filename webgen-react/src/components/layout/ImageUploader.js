import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useTranslation } from 'react-i18next';

export const ImageUploader = (props) => {
    const {t} = useTranslation()
    const [totalSize, setTotalSize] = useState(0);
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const [file, setFile] = useState(null);
    const [maxSize, setMaxSize] = useState(2);


    useEffect(() => {
        setMaxSize(parseInt(process.env.REACT_APP_MAX_IMG_SIZE));
    }, []);

    useEffect(() => {
        props.childFunc.current = onSubmit
    }, [file]);

    const onSubmit = () => {
        props.loadImage(file)
    };

    const onTemplateSelect = (e) => {
        let _totalSize = totalSize;
        fileUploadRef.current.files.forEach((file) => {
            _totalSize += file.size;
        });
        setFile(fileUploadRef.current.files[0]);
        setTotalSize(_totalSize);
        removeLastImage();
    };

    const onTemplateUpload = (e) => {
        let _totalSize = 0;
        e.files.forEach(file => {
            _totalSize += (file.size || 0);
        });

        setTotalSize(_totalSize);
        toast.current.show({severity: 'info', summary: 'Success', detail: 'File Uploaded'});
    }

    const removeLastImage = () => {
        console.log(document.getElementsByClassName("p-fileupload-row")[0]);
        if (
            document.getElementsByClassName("p-fileupload-row")[0] !== undefined
        )
            document
                .getElementsByClassName("p-fileupload-row")[0]
                .children[0].children[2].click();
    }

    const onTemplateRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        callback();
    }

    const onTemplateClear = () => {
        setTotalSize(0);
    }

    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        const value = totalSize/10000;
        const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div className={className} style={{backgroundColor: 'transparent', display: 'flex', alignItems: 'center'}}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <ProgressBar
                    value={value}
                    displayValueTemplate={() =>
                        `${formatedValue} / ${maxSize} MB`
                    }
                    style={{
                        width: 300,
                        height: "20px",
                        marginLeft: "auto",
                    }}
                />
                {/* <ProgressBar value={value} displayValueTemplate={() => `${formatedValue} / 1 MB`} style={{width: '300px', height: '20px', marginLeft: 'auto'}}></ProgressBar> */}
            </div>
        );
    }

    const itemTemplate = (file, props) => {
        return (
            <div className="grid">
                <div className="col-2">
                    <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                </div>
                <div className="col-6" style={{wordWrap:"break-word", textAlign:"left", paddingLeft:"1em"}}>
                    <span >
                        {file.name}
                    </span>
                </div>
                <div className="col-4">
                    <Tag value={props.formatSize} severity="warning" className="p-px-3 p-py-2" style={{margin:"0 8px 10px 0"}} />
                    <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger p-ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
                </div>
            </div>
        )
    }

    const emptyTemplate = () => {
        return (
            <div className="grid" style={{margin:"-1em"}}>
                <div className="col-4"></div>
                <div className="col-4"  style={{textAlign:"center"}}>                
                    <i className="pi pi-image p-mt-3 p-p-5" style={{'fontSize': '4em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)'}}></i>
                </div>
                <div className="col-4"></div>

                <div className="col-4"></div>
                <div className="col-4" style={{textAlign:"center"}}>
                    <span style={{'fontSize': '1em', color: 'var(--text-color-secondary)'}} 
                    className="p-my-5">{t('drag_drop_image')}</span>
                </div>
                <div className="col-4"></div>
            </div>
        )
    }

    const chooseOptions = {icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined'};
    const uploadOptions = {icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined'};
    const cancelOptions = {icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'};

    return (
        <div>
            <Toast ref={toast}></Toast>
            
            <FileUpload ref={fileUploadRef} name="demo[]"  multiple accept="image/*" maxFileSize={1000000}
                onUpload={onTemplateUpload} onSelect={onTemplateSelect} onError={onTemplateClear} onClear={onTemplateClear}
                headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions} uploadOptions={uploadOptions} cancelOptions={cancelOptions} />
                
        </div>
    )
}