import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavItem from './navItem';
import { useAuth } from '@/src/context/authContext';
import { permissionRequired }from '@/utils/auth'


const Sidebar = () => {
    const router = useRouter();
    const { auth } = useAuth();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [router.pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const navAdmItems = [
        { label: 'Tipos De Moneda', href: '/apps/tiposMoneda', icon: 'typeCoinIcon' },
        { label: 'Usuarios', href: '/apps/users', icon: 'userIcon' },
        { label: 'Catalogo de Cuenta', href: '/apps/catalogoCuentaContable', icon: 'catalogIcon' },
        { label: 'Auxiliares', href: '/apps/auxiliares', icon: 'modelsIcon' },
        { label: 'Tipo De Cuenta', href: '/apps/tiposCuenta', icon: 'typeAccountIcon' },
        { label: 'Entradas Contables', href: '/apps/entradasContable', icon: 'entryIcon' },
        //{ label: 'Vehiculo', href: '/apps/vehiculos', icon: 'vehicleIcon' },
    ];

    const iconsAdm: { [key: string]: JSX.Element } = {
        vehicleIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10C4 6.22876 4 4.34315 5.17157 3.17157C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.17157C20 4.34315 20 6.22876 20 10V12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34315 20 5.17157 18.8284C4 17.6569 4 15.7712 4 12V10Z" stroke="currentcolor" stroke-width="1.5"/>
            <path opacity="0.5" d="M4 13H20" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15.5 16H17" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 16H8.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path opacity="0.5" d="M6 19.5V21C6 21.5523 6.44772 22 7 22H8.5C9.05228 22 9.5 21.5523 9.5 21V20" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path opacity="0.5" d="M18 19.5V21C18 21.5523 17.5523 22 17 22H15.5C14.9477 22 14.5 21.5523 14.5 21V20" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path opacity="0.5" d="M20 9H21C21.5523 9 22 9.44772 22 10V11C22 11.3148 21.8518 11.6111 21.6 11.8L20 13" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path opacity="0.5" d="M4 9H3C2.44772 9 2 9.44772 2 10V11C2 11.3148 2.14819 11.6111 2.4 11.8L4 13" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path opacity="0.5" d="M19.5 5H4.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>

        ),
        entryIcon:(
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.5" d="M16.755 2H7.24502C6.08614 2 5.50671 2 5.03939 2.16261C4.15322 2.47096 3.45748 3.18719 3.15795 4.09946C3 4.58055 3 5.17705 3 6.37006V20.3742C3 21.2324 3.985 21.6878 4.6081 21.1176C4.97417 20.7826 5.52583 20.7826 5.8919 21.1176L6.375 21.5597C7.01659 22.1468 7.98341 22.1468 8.625 21.5597C9.26659 20.9726 10.2334 20.9726 10.875 21.5597C11.5166 22.1468 12.4834 22.1468 13.125 21.5597C13.7666 20.9726 14.7334 20.9726 15.375 21.5597C16.0166 22.1468 16.9834 22.1468 17.625 21.5597L18.1081 21.1176C18.4742 20.7826 19.0258 20.7826 19.3919 21.1176C20.015 21.6878 21 21.2324 21 20.3742V6.37006C21 5.17705 21 4.58055 20.842 4.09946C20.5425 3.18719 19.8468 2.47096 18.9606 2.16261C18.4933 2 17.9139 2 16.755 2Z" stroke="currentcolor" stroke-width="1.5"/>
            <path d="M9.5 10.4L10.9286 12L14.5 8" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.5 15.5H16.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>


        ),
        typeAccountIcon:(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.5" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentcolor" stroke-width="1.5"/>
            <path d="M17 11V10C17 8.11438 17 7.17157 16.4142 6.58579C15.8284 6 14.8856 6 13 6H11C9.11438 6 8.17157 6 7.58579 6.58579C7 7.17157 7 8.11438 7 10V11" stroke="#1C274C" stroke-width="1.5"/>
            <path d="M5 11H19" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            <path opacity="0.5" d="M8 16H16" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>


        ), 
        modelsIcon:(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.5" d="M16.755 2H7.24502C6.08614 2 5.50671 2 5.03939 2.16261C4.15322 2.47096 3.45748 3.18719 3.15795 4.09946C3 4.58055 3 5.17705 3 6.37006V20.3742C3 21.2324 3.985 21.6878 4.6081 21.1176C4.97417 20.7826 5.52583 20.7826 5.8919 21.1176L6.375 21.5597C7.01659 22.1468 7.98341 22.1468 8.625 21.5597C9.26659 20.9726 10.2334 20.9726 10.875 21.5597C11.5166 22.1468 12.4834 22.1468 13.125 21.5597C13.7666 20.9726 14.7334 20.9726 15.375 21.5597C16.0166 22.1468 16.9834 22.1468 17.625 21.5597L18.1081 21.1176C18.4742 20.7826 19.0258 20.7826 19.3919 21.1176C20.015 21.6878 21 21.2324 21 20.3742V6.37006C21 5.17705 21 4.58055 20.842 4.09946C20.5425 3.18719 19.8468 2.47096 18.9606 2.16261C18.4933 2 17.9139 2 16.755 2Z" stroke="currentcolor" stroke-width="1.5"/>
            <path d="M10.5 11L17 11" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M7 11H7.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M7 7.5H7.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M7 14.5H7.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M10.5 7.5H17" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M10.5 14.5H17" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>


        ),
        catalogIcon:(
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.90565 13.793C2.48385 10.6294 2.27294 9.04765 3.16932 8.02383C4.0657 7 5.66147 7 8.85302 7H15.1468C18.3384 7 19.9341 7 20.8305 8.02383C21.7269 9.04765 21.516 10.6294 21.0942 13.793L20.6942 16.793C20.3634 19.2739 20.198 20.5143 19.3495 21.2572C18.5011 22 17.2497 22 14.7468 22H9.25302C6.75018 22 5.49877 22 4.6503 21.2572C3.80183 20.5143 3.63644 19.2739 3.30565 16.793L2.90565 13.793Z" stroke="currentcolor" stroke-width="1.5"/>
            <path opacity="0.5" d="M19.562 7C19.7906 5.69523 18.7866 4.5 17.4619 4.5H6.53812C5.21347 4.5 4.20946 5.69523 4.43809 7M17.5 4.5C17.5284 4.24092 17.5426 4.11135 17.5428 4.00435C17.5451 2.98072 16.774 2.12064 15.7562 2.01142C15.6498 2 15.5195 2 15.2589 2H8.74109C8.48044 2 8.35012 2 8.24372 2.01142C7.22594 2.12064 6.45491 2.98072 6.45713 4.00434C6.45736 4.11135 6.47155 4.2409 6.49993 4.5" stroke="currentcolor" stroke-width="1.5"/>
            <path d="M15 18H9" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>


        ),
        typeCoinIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 6V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>

            
        ),
        userIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="6" r="4" stroke="currentColor" stroke-width="1.5" />
                <path opacity="0.5" d="M18 9C19.6569 9 21 7.88071 21 6.5C21 5.11929 19.6569 4 18 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path opacity="0.5" d="M6 9C4.34315 9 3 7.88071 3 6.5C3 5.11929 4.34315 4 6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <ellipse cx="12" cy="17" rx="6" ry="4" stroke="currentColor" stroke-width="1.5" />
                <path opacity="0.5" d="M20 19C21.7542 18.6153 23 17.6411 23 16.5C23 15.3589 21.7542 14.3847 20 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path opacity="0.5" d="M4 19C2.24575 18.6153 1 17.6411 1 16.5C1 15.3589 2.24575 14.3847 4 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
        ),
    };

    // const navItems = [
    //     { label: 'Clientes', href: '/apps/clientes', icon: 'customersIcon' },
    //     { label: 'Renta Y Devolucion', href: '/apps/rentaDevolucion', icon: 'rentIcon' },
    //     { label: 'Inspeccion', href: '/apps/inspeccion', icon: 'inspecIcon' },
    // ];

    const icons: { [key: string]: JSX.Element } = {
        inspecIcon:(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11.5" cy="11.5" r="9.5" stroke="currentcolor" stroke-width="1.5"/>
            <path d="M20 20L22 22" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            ),
        rentIcon:(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.5" d="M16.755 2H7.24502C6.08614 2 5.50671 2 5.03939 2.16261C4.15322 2.47096 3.45748 3.18719 3.15795 4.09946C3 4.58055 3 5.17705 3 6.37006V20.3742C3 21.2324 3.985 21.6878 4.6081 21.1176C4.97417 20.7826 5.52583 20.7826 5.8919 21.1176L6.375 21.5597C7.01659 22.1468 7.98341 22.1468 8.625 21.5597C9.26659 20.9726 10.2334 20.9726 10.875 21.5597C11.5166 22.1468 12.4834 22.1468 13.125 21.5597C13.7666 20.9726 14.7334 20.9726 15.375 21.5597C16.0166 22.1468 16.9834 22.1468 17.625 21.5597L18.1081 21.1176C18.4742 20.7826 19.0258 20.7826 19.3919 21.1176C20.015 21.6878 21 21.2324 21 20.3742V6.37006C21 5.17705 21 4.58055 20.842 4.09946C20.5425 3.18719 19.8468 2.47096 18.9606 2.16261C18.4933 2 17.9139 2 16.755 2Z" stroke="currentcolor" stroke-width="1.5"/>
                <path d="M10.5 11L17 11" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M7 11H7.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M7 7.5H7.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M7 14.5H7.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M10.5 7.5H17" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M10.5 14.5H17" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            ), 
        customersIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentcolor" stroke-width="1.5" />
                <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
                <path
                    d="M16 10.5C16 11.3284 15.5523 12 15 12C14.4477 12 14 11.3284 14 10.5C14 9.67157 14.4477 9 15 9C15.5523 9 16 9.67157 16 10.5Z"
                    fill="currentcolor"
                />
                <ellipse cx="9" cy="10.5" rx="1" ry="1.5" fill="currentcolor" />
            </svg>
            
        ),
        
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed top-0 bottom-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">{t('Lorewart')}</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="m-auto h-5 w-5">
                                <path d="M13 19L7 12L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path opacity="0.5" d="M16.9998 19L10.9998 12L16.9998 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                        <li className="nav-item">
                                <ul>
                                    <li className="nav-item">
                                        <Link href="/" className="group">
                                            <div className="flex items-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M6.4443 3.6853C6.97115 3.33327 7.52766 3.03383 8.10577 2.7894C9.50868 2.19627 10.2101 1.8997 11.1051 2.49296C12 3.08623 12 4.05748 12 6V8C12 9.88561 12 10.8284 12.5858 11.4142C13.1716 12 14.1144 12 16 12H18C19.9425 12 20.9138 12 21.507 12.8949C22.1003 13.7899 21.8037 14.4913 21.2106 15.8942C20.9662 16.4723 20.6667 17.0288 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8078C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17316C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853Z" stroke="currentColor" stroke-width="1.5"/>
                                                    <path opacity="0.5" d="M14.5 2.31506C18.014 3.21951 20.7805 5.986 21.685 9.50002" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                                </svg>

                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Dashboard')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            {permissionRequired(['admin'], auth.permissions || []) && (
                                <>
                                    <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 py-3 px-7 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                        <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                        <span>{t('Administration')}</span>
                                    </h2>
                                    {navAdmItems.map((item, index) => (
                                        <li className="nav-item" key={index}>
                                            <ul>
                                                <li className="nav-item">
                                                    <Link href={item.href} className="group">
                                                        <div className="flex items-center">
                                                            {iconsAdm[item.icon]}
                                                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t(item.label)}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </li>
                                    ))}
                                </>
                            )}

                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 py-3 px-7 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>{t('Modules')}</span>
                            </h2>

                            {/* {navItems.map((item, index) => (
                                <li className="nav-item" key={index}>
                                    <ul>
                                        <li className="nav-item">
                                            <Link href={item.href} className="group">
                                                <div className="flex items-center">
                                                    {icons[item.icon]}
                                                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t(item.label)}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            ))} */}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
