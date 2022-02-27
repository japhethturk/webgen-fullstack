import { Button } from 'primereact/button';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import { Dialog } from 'primereact/dialog';
import { Messages } from 'primereact/messages';
import { Password } from 'primereact/password';
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserService } from '../service/UserService';
import StateContext from '../util/context/StateContext';
import { Toast } from 'primereact/toast';


export const Users = () => {

    const {t} = useTranslation()
    const toast = useRef(null)
    const messages = useRef(null)
    const [visible, setVisible] = useState(false)
    const [removeId, setRemoveId] = useState(null)
    const [removeAccept, setRemoveAccept] = useState(false)
    const [displayAddDialog, setDisplayAddDialog] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassowrd, setRePassword] = useState('')
    const [users, setUsers] = useState([])
    const appState = useContext(StateContext);
    const userService = new UserService()


    useEffect(()=> {
        userService.all(appState.admin.token).then((response) => {
            if (response.code !== undefined) {
                if (response.code === "ok") {
                    setUsers(response.users)
                } else {
                    messages.current.show([response.message]);
                }
            } else {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
            }
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (removeAccept) {
            userService.remove(removeId, appState.admin.token).then((response) => {
                if (response.code === "ok") {
                    let unRemoved = users.filter(function (item) {
                        return item._source.id !== removeId;
                    })
                    setUsers(unRemoved)
                    setEmail('')
                    setPassword('')
                    setRePassword('')
                    toast.current.show([{severity: "success", summary: t("success"), detail: t("removed_successfully")},]);
                } else {
                    toast.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response")},]);
                }
            }).finally(()=>{
                setRemoveId(null)
            })
            setRemoveAccept(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [removeAccept])


    const addUser = () => {
        let error = false;

        if (password !== rePassowrd || password.length < 5) {
            error = true
            toast.current.show([{sticky: true, severity: 'error', summary: t('error'), detail: t('wrong_new_email')}])
        }

        if (!email.includes("@")) {
            error = true
            toast.current.show([{sticky: true, severity: 'error', summary: t('error'), detail: t('wrong_email')}])
        }

        if (password < 5) {
            error = true
            toast.current.show([{sticky: true, severity: 'error', summary: t('error'), detail: t('wrong_password')}])
        } 

        if (!error) {
            let requestBody = {
                email,
                password
            }
            userService.add(requestBody, appState.admin.token).then(response => {
                if (response.code === "ok") {
                    setUsers(old => [...old, {_source:response.data}])
                    setDisplayAddDialog(false)
                } else if (response.code === "exist") {
                    toast.current.show([{ severity: 'error', summary: t('error'), detail: t('exist_email')}])
                } else {
                    toast.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            })
        }
    }
    

    const confirmDelete = (event, rowData) => {
        setRemoveId(rowData._source.id)
        confirmPopup({
            target: event.currentTarget,
            message: t('confirmation_delete'),
            rejectLabel: t('no'),
            acceptLabel: t('yes'),
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept
        });
    };

    const accept = (id) => {
        setRemoveAccept(true)
        toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
    };

    const renderFooter = () => {
        return (
            <div>
                <Button label={t('give_up')} icon="pi pi-times" onClick={(e) => setDisplayAddDialog(false)} className="p-button-text" />
                <Button label={t('add')} icon="pi pi-check"  onClick={(e) => addUser()} autoFocus />
            </div>
        );
    }

    const actionTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button label={t('delete')} icon="pi pi-times" className="p-button-text p-button-danger" onClick={(e)=>{confirmDelete(e, rowData)}} />
            </React.Fragment>
        );
    };

    return (
        <div className="grid">
            <Toast ref={toast}></Toast>
            <ConfirmPopup target={document.getElementById('button')} visible={visible} onHide={() => setVisible(false)} message="Are you sure you want to proceed?"
                    icon="pi pi-exclamation-triangle" accept={accept} />

            <Dialog header={t('add_new_user')} visible={displayAddDialog} style={{ width: '50vw' }} footer={renderFooter('displayBasic')} onHide={() => setDisplayAddDialog(false)}>
                <div className="grid p-fluid">
                    <div className="col-12">
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-envelope"></i>
                            </span>
                            <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')}  />
                        </div>
                    </div>
                    
                    <div className="col-12">
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-key"></i>
                            </span>
                            <Password value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} feedback={false}/>
                        </div>
                    </div>
                    
                    <div className="col-12">
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-key"></i>
                            </span>
                            <Password value={rePassowrd} onChange={(e) => setRePassword(e.target.value)} placeholder={t('repat_type')} feedback={false}/>
                        </div>
                    </div>
                    
                </div>
            </Dialog>

            <div className="col-12">
                <div className="card">
                    <Messages ref={messages}/>
                    <div className="flex align-items-center justify-content-between mb-0 pb-0 mb-3">
                        <h4 className="m-0">{t('users')}</h4>
                        <Button label={t('add')} icon="pi pi-plus" iconPos="right" className="p-button-text" onClick={(e) => setDisplayAddDialog(true)}/>
                    </div>

                    <div className="datatable-responsive">
                        <DataTable value={users} responsiveLayout="scroll"  emptyMessage={t('no_records_found')}>
                            <Column field="_source.email" header={t('email')}></Column>
                            <Column field="_source.role" header={t('role')}></Column>
                            <Column header={t("operation")} body={actionTemplate}  style={{width: 100}}/>
                        </DataTable>  
                    </div>
                    
                </div>
            </div>
        </div>
    )

}