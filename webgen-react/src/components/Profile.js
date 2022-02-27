import React, { useContext, useEffect, useRef, useState } from 'react';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useTranslation } from 'react-i18next';
import { Password } from 'primereact/password';
import StateContext from '../util/context/StateContext';
import { Messages } from 'primereact/messages';
import { UserService } from '../service/UserService';
import DispatchContext from '../util/context/DispatchContext';

export const Profile = () => {

    const {t} = useTranslation()
    const messages = useRef(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [newPassowrd, setNewPassword] = useState('')
    const [rePassowrd, setRePassword] = useState('')
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const userService = new UserService()


    useEffect(()=> {
        setEmail(appState.admin.email)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onSave = () => {
        let error = false;
        messages.current.clear()

        if (newPassowrd.length > 0 ) {
            if (newPassowrd !== rePassowrd || newPassowrd.length < 5) {
                error = true
                messages.current.show([{sticky: true, severity: 'error', summary: t('error'), detail: t('wrong_new_email')}])
            }
        }

        if (!email.includes("@")) {
            error = true
            messages.current.show([{sticky: true, severity: 'error', summary: t('error'), detail: t('wrong_email')}])
        }

        if (password < 5) {
            error = true
            messages.current.show([{sticky: true, severity: 'error', summary: t('error'), detail: t('wrong_password')}])
        } 
        
        if (!error) {
            let requestBody = {
                userEmail: appState.admin.email,
                email,
                password,
                newPassowrd
            }
            
            userService.update(requestBody, appState.admin.id, appState.admin.token).then((response) => {
                if (response.code !== undefined) {
                    if (response.code === "ok") {
                        appDispatch({type: "updateMail", data: email});
                        setPassword('')
                        setNewPassword('')
                        setRePassword('')
                        messages.current.show([{severity: "success", summary: t("success"), detail: t("success_update"), sticky: true,},]);
                    } else {
                        messages.current.show([response.message]);
                    }
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            })
            .catch((e) => {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
            })
        }
    }

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>{t('profile')}</h5>
                    <Messages ref={messages}/>
                    <div className="grid p-fluid">
                        <div className="col-12">
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-envelope"></i>
                                </span>
                                <InputText  value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('password')}  />
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
                                <Password value={newPassowrd} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('new_password')} feedback={false}/>
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

                        <div className="col-12 md:col-10"/>
                        <div className="col-12 md:col-2">
                            <div className="p-inputgroup">
                                <Button style={{width: "100%"}} label={t('save')} onClick={(e) => onSave()}/>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )

}