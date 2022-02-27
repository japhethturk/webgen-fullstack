import React, { useContext }  from 'react';
import { Link, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import DispatchContext from './util/context/DispatchContext';
import { useTranslation } from 'react-i18next';
import StateContext from './util/context/StateContext';

export const AppTopbar = (props) => {

    const {t} = useTranslation()
    const history = useHistory();
    const appDispatch = useContext(DispatchContext)
    const appState = useContext(StateContext)


    return (
        <div className="layout-topbar">
            <Link to="/" className="layout-topbar-logo">
            <img style={{height:"2.5em"}} alt="Logo" src='assets/layout/images/logo.png'
                     onError={(e) => e.target.src='assets/layout/images/empty.png'} />
            </Link>

            <button type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={props.onMobileTopbarMenuClick}>
                <i className="pi pi-ellipsis-v" />
            </button>

                <ul className={classNames("layout-topbar-menu lg:flex origin-top", {'layout-topbar-menu-mobile-active': props.mobileTopbarMenuActive })}>
                    {
                        appState.admin.role === "admin" ?
                            <li>
                                <button className="p-link layout-topbar-button" onClick={(e) => history.push('/users')}>
                                    <i className="pi pi-users"/>
                                    <span>{t('users')}</span>
                                </button>
                            </li>
                        :
                            <></>
                    }
                    
                    <li>
                        <button className="p-link layout-topbar-button" onClick={(e) => history.push('/profile')}>
                            <i className="pi pi-user"/>
                            <span>{t('profile')}</span>
                        </button>
                    </li>
                    <li>
                        <button className="p-link layout-topbar-button" onClick={()=> appDispatch({type: "logoutAdmin"})}>
                            <i className="pi pi-power-off"/>
                            <span>{t('log_out')}</span>
                        </button>
                    </li>
                </ul>
        </div>
    );
}
