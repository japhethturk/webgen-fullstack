import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import {Route} from 'react-router-dom';
import {CSSTransition} from 'react-transition-group';

import {AppTopbar} from './AppTopbar';
import {AppFooter} from './AppFooter';

import {Blogs} from './components/Blogs';
import {BlogEditor} from './components/BlogEditor';
import {Profile} from './components/Profile';
import {Users} from './components/Users';
import {Preview} from './components/Preview';

import StateContext from "./util/context/StateContext"
import DispatchContext from "./util/context/DispatchContext"
import {useImmerReducer} from "use-immer"
import Cookies from "js-cookie";

import PrimeReact from 'primereact/api';

// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';
// import 'primeflex/primeflex.css';
// import 'prismjs/themes/prism-coy.css';
import './layout/flags/flags.css';
import './layout/layout.scss';
import './App.scss';
import "./util/i18n";
import Login from './Login';
import {UserService} from './service/UserService';
import {Functions} from './util/Functions';

const App = () => {
    // const {t} = useTranslation()

    const layoutMode = 'static'
    const layoutColorMode = 'light'
    const inputStyle = 'outlined'
    const ripple = true
    const [staticMenuInactive, setStaticMenuInactive] = useState(false)
    const [overlayMenuActive, setOverlayMenuActive] = useState(false)
    const [mobileMenuActive, setMobileMenuActive] = useState(false)
    const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false)
    const userService = new UserService()

    PrimeReact.ripple = true;

    let menuClick = false;
    let mobileTopbarMenuClick = false;

    const initialState = {
        isMobile: false,
        langId: localStorage.getItem("LANG_ID") ? localStorage.getItem("LANG_ID") : "1",
        channel: null,
        siteData: {},
        checkToken: false,
        admin: {
            id: localStorage.getItem("ADMIN_ID"),
            token: localStorage.getItem("ADMIN_TOKEN"),
            email: localStorage.getItem("ADMIN_EMAIL"),
            role: localStorage.getItem("ADMIN_ROLE")
        },
        adminLoggedIn: localStorage.getItem("ADMIN_LOGGED_IN") ? Boolean(localStorage.getItem("ADMIN_LOGGED_IN")) : false,
    }


    function ourReducer(draft, action) {
        switch (action.type) {
            case "loginAdmin":
                draft.adminLoggedIn = true
                draft.admin = action.data
                return
            case "logoutAdmin":
                draft.adminLoggedIn = false
                draft.admin = {
                    id: '',
                    token: '',
                    name: '',
                    role: ''
                }
                return
            case "updateMail":
                draft.admin.email = action.data
                return
            default:
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)


    useEffect(() => {
        let isMounted = true;
        if (state.adminLoggedIn) {
            userService.checkToken(state.admin.token).then((response) => {
                    if (response.code !== "ok" && isMounted) {
                        if (Cookies.get("ADMIN_EMAIL") !== undefined && Cookies.get("ADMIN_PASSWORD") !== undefined) {
                            let decipher = Functions.decipher(process.env.REACT_APP_NAME);
                            let values = {email: Cookies.get("ADMIN_EMAIL"), password: decipher(Cookies.get("ADMIN_PASSWORD")),};
                            userService.login(values).then((response) => {
                                if (response.code === "ok") {
                                    dispatch({type: "loginAdmin", data: response,});
                                } else {
                                    dispatch({type: "logoutAdmin"});
                                }
                            }).catch((e) => {
                                dispatch({type: "logoutAdmin"});
                            });
                        } else {
                            dispatch({type: "logoutAdmin"});
                        }
                    } else if (response.code !== "not_found") {
                        dispatch({type: "toast", data: response.message});
                    }
                }).catch((e) => {
                dispatch({type: "logoutAdmin"});
            });
        }
    
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        if (state.adminLoggedIn) {
            localStorage.setItem("ADMIN_ID", state.admin.id);
            localStorage.setItem("ADMIN_TOKEN", state.admin.token);
            localStorage.setItem("ADMIN_EMAIL", state.admin.email);
            localStorage.setItem("ADMIN_ROLE", state.admin.role);
            localStorage.setItem("ADMIN_LOGGED_IN", state.adminLoggedIn.toString());
        } else {
            localStorage.removeItem("ADMIN_ID");
            localStorage.removeItem("ADMIN_TOKEN");
            localStorage.removeItem("ADMIN_EMAIL");
            localStorage.removeItem("ADMIN_ROLE");
            localStorage.removeItem("ADMIN_LOGGED_IN");
            Cookies.remove("ADMIN_EMAIL");
            Cookies.remove("ADMIN_PASSWORD");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.adminLoggedIn])

    // useEffect(() => {
    //     localStorage.setItem("LANG_ID", state.langId);
    // }, [state.langId])

    useEffect(() => {
        if (mobileMenuActive) {
            addClass(document.body, "body-overflow-hidden");
        } else {
            removeClass(document.body, "body-overflow-hidden");
        }
    }, [mobileMenuActive]);

    const onWrapperClick = (event) => {
        if (!menuClick) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }

        if (!mobileTopbarMenuClick) {
            setMobileTopbarMenuActive(false);
        }

        mobileTopbarMenuClick = false;
        menuClick = false;
    }

    const onToggleMenuClick = (event) => {
        menuClick = true;

        if (isDesktop()) {
            if (layoutMode === 'overlay') {
                if (mobileMenuActive === true) {
                    setOverlayMenuActive(true);
                }

                setOverlayMenuActive((prevState) => !prevState);
                setMobileMenuActive(false);
            } else if (layoutMode === 'static') {
                setStaticMenuInactive((prevState) => !prevState);
            }
        } else {
            setMobileMenuActive((prevState) => !prevState);
        }

        event.preventDefault();
    }

    // const onSidebarClick = () => {
    //     menuClick = true;
    // }

    const onMobileTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        setMobileTopbarMenuActive((prevState) => !prevState);
        event.preventDefault();
    }

    const onMobileSubTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        event.preventDefault();
    }

    const isDesktop = () => {
        return window.innerWidth >= 992;
    }

    const addClass = (element, className) => {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }

    const removeClass = (element, className) => {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    const wrapperClass = classNames('layout-wrapper', {
        'layout-overlay': layoutMode === 'overlay',
        'layout-static': layoutMode === 'static',
        'layout-static-sidebar-inactive': staticMenuInactive && layoutMode === 'static',
        'layout-overlay-sidebar-active': overlayMenuActive && layoutMode === 'overlay',
        'layout-mobile-sidebar-active': mobileMenuActive,
        'p-input-filled': inputStyle === 'filled',
        'p-ripple-disabled': ripple === false,
        'layout-theme-light': layoutColorMode === 'light'
    });


    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
            {
                    state.adminLoggedIn ? 
                    <div className={wrapperClass} onClick={onWrapperClick}>
                    <AppTopbar onToggleMenuClick={onToggleMenuClick} layoutColorMode={layoutColorMode}
                                mobileTopbarMenuActive={mobileTopbarMenuActive} onMobileTopbarMenuClick={onMobileTopbarMenuClick} onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick}/>

                        <div className="layout-main" style={{marginTop:"7em"}}>
                            <Route path="/" exact component={Blogs}/>
                            <Route path="/blog/add" component={BlogEditor}/>
                            <Route path="/blog/edit/:url" component={BlogEditor}/>
                            <Route path="/profile" component={Profile}/>
                            <Route path="/users" component={Users}/>
                            <Route path="/preview/:url" component={Preview}/>
                        </div>

                        <AppFooter layoutColorMode={layoutColorMode}/>


                    <CSSTransition classNames="layout-mask" timeout={{enter: 200, exit: 200}} in={mobileMenuActive} unmountOnExit>
                        <div className="layout-mask p-component-overlay"></div>
                    </CSSTransition>

                </div>
                :
                <Login />
            }
            </DispatchContext.Provider>
        </StateContext.Provider>
    );


}

export default App;
