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
        { label: 'Tipos De Moneda', href: '/apps/tiposMoneda', icon: 'employeeIcon' },
        { label: 'Usuarios', href: '/apps/users', icon: 'userIcon' },
        { label: 'Marcas', href: '/apps/marcas', icon: 'brandIcon' },
        { label: 'Modelos', href: '/apps/modelos', icon: 'modelsIcon' },
        { label: 'Tipo De Combustible', href: '/apps/tipoCombustibles', icon: 'fuelIcon' },
        { label: 'Tipo De Vehiculo', href: '/apps/tiposVehiculos', icon: 'vehicleTypeIcon' },
        { label: 'Vehiculo', href: '/apps/vehiculos', icon: 'vehicleIcon' },
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
        vehicleTypeIcon:(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 6.5V4.5C8 4.03534 8 3.80302 7.96157 3.60982C7.80376 2.81644 7.18356 2.19624 6.39018 2.03843C6.19698 2 5.96466 2 5.5 2C5.03534 2 4.80302 2 4.60982 2.03843C3.81644 2.19624 3.19624 2.81644 3.03843 3.60982C3 3.80302 3 4.03534 3 4.5V6.5C3 6.96466 3 7.19698 3.03843 7.39018C3.19624 8.18356 3.81644 8.80376 4.60982 8.96157C4.80302 9 5.03534 9 5.5 9C5.96466 9 6.19698 9 6.39018 8.96157C7.18356 8.80376 7.80376 8.18356 7.96157 7.39018C8 7.19698 8 6.96466 8 6.5Z" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M21 6.5V4.5C21 4.03534 21 3.80302 20.9616 3.60982C20.8038 2.81644 20.1836 2.19624 19.3902 2.03843C19.197 2 18.9647 2 18.5 2C18.0353 2 17.803 2 17.6098 2.03843C16.8164 2.19624 16.1962 2.81644 16.0384 3.60982C16 3.80302 16 4.03534 16 4.5V6.5C16 6.96466 16 7.19698 16.0384 7.39018C16.1962 8.18356 16.8164 8.80376 17.6098 8.96157C17.803 9 18.0353 9 18.5 9C18.9647 9 19.197 9 19.3902 8.96157C20.1836 8.80376 20.8038 8.18356 20.9616 7.39018C21 7.19698 21 6.96466 21 6.5Z" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M8 19.5V17.5C8 17.0353 8 16.803 7.96157 16.6098C7.80376 15.8164 7.18356 15.1962 6.39018 15.0384C6.19698 15 5.96466 15 5.5 15C5.03534 15 4.80302 15 4.60982 15.0384C3.81644 15.1962 3.19624 15.8164 3.03843 16.6098C3 16.803 3 17.0353 3 17.5V19.5C3 19.9647 3 20.197 3.03843 20.3902C3.19624 21.1836 3.81644 21.8038 4.60982 21.9616C4.80302 22 5.03534 22 5.5 22C5.96466 22 6.19698 22 6.39018 21.9616C7.18356 21.8038 7.80376 21.1836 7.96157 20.3902C8 20.197 8 19.9647 8 19.5Z" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M21 19.5V17.5C21 17.0353 21 16.803 20.9616 16.6098C20.8038 15.8164 20.1836 15.1962 19.3902 15.0384C19.197 15 18.9647 15 18.5 15C18.0353 15 17.803 15 17.6098 15.0384C16.8164 15.1962 16.1962 15.8164 16.0384 16.6098C16 16.803 16 17.0353 16 17.5V19.5C16 19.9647 16 20.197 16.0384 20.3902C16.1962 21.1836 16.8164 21.8038 17.6098 21.9616C17.803 22 18.0353 22 18.5 22C18.9647 22 19.197 22 19.3902 21.9616C20.1836 21.8038 20.8038 21.1836 20.9616 20.3902C21 20.197 21 19.9647 21 19.5Z" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path opacity="0.5" d="M16 18.5H8M16 5.5H8M12 18.5V5.5" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>

        ),
        fuelIcon:(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 22V8C16 5.17157 16 3.75736 15.1213 2.87868C14.2426 2 12.8284 2 10 2H9C6.17157 2 4.75736 2 3.87868 2.87868C3 3.75736 3 5.17157 3 8V22" stroke="currentcolor" stroke-width="1.5"/>
                <path d="M11 6H8C7.05719 6 6.58579 6 6.29289 6.29289C6 6.58579 6 7.05719 6 8C6 8.94281 6 9.41421 6.29289 9.70711C6.58579 10 7.05719 10 8 10H11C11.9428 10 12.4142 10 12.7071 9.70711C13 9.41421 13 8.94281 13 8C13 7.05719 13 6.58579 12.7071 6.29289C12.4142 6 11.9428 6 11 6Z" stroke="currentcolor" stroke-width="1.5"/>
                <path opacity="0.5" d="M7 17H12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M17 22H2" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
                <path opacity="0.5" d="M19.9685 3.41435C19.6451 3.15559 19.1731 3.20803 18.9143 3.53148C18.6556 3.85493 18.708 4.32689 19.0315 4.58565L19.9685 3.41435ZM20.7331 4.98647L21.2016 4.40082L21.2016 4.40082L20.7331 4.98647ZM16 16.25C15.5858 16.25 15.25 16.5858 15.25 17C15.25 17.4142 15.5858 17.75 16 17.75V16.25ZM21.0025 5.20805L20.5019 5.76651L20.5019 5.76651L21.0025 5.20805ZM21.9953 7.27364L22.7441 7.23158V7.23158L21.9953 7.27364ZM22 8.75C22.4142 8.75 22.75 8.41421 22.75 8C22.75 7.58579 22.4142 7.25 22 7.25V8.75ZM20.0257 13.3419L19.7885 14.0534H19.7885L20.0257 13.3419ZM21.7628 14.7115C22.1558 14.8425 22.5805 14.6301 22.7115 14.2372C22.8425 13.8442 22.6301 13.4195 22.2372 13.2885L21.7628 14.7115ZM19.0315 4.58565L20.2646 5.57212L21.2016 4.40082L19.9685 3.41435L19.0315 4.58565ZM21.25 7.62244V18.5H22.75V7.62244H21.25ZM19.75 18.5V18.4286H18.25V18.5H19.75ZM17.5714 16.25H16V17.75H17.5714V16.25ZM19.75 18.4286C19.75 17.2254 18.7746 16.25 17.5714 16.25V17.75C17.9462 17.75 18.25 18.0538 18.25 18.4286H19.75ZM20.5 19.25C20.0858 19.25 19.75 18.9142 19.75 18.5H18.25C18.25 19.7426 19.2574 20.75 20.5 20.75V19.25ZM21.25 18.5C21.25 18.9142 20.9142 19.25 20.5 19.25V20.75C21.7426 20.75 22.75 19.7426 22.75 18.5H21.25ZM20.2646 5.57212C20.4091 5.68771 20.4585 5.72766 20.5019 5.76651L21.5031 4.64959C21.4211 4.57606 21.3328 4.50574 21.2016 4.40082L20.2646 5.57212ZM22.75 7.62244C22.75 7.45448 22.7503 7.34157 22.7441 7.23158L21.2465 7.3157C21.2497 7.37381 21.25 7.43741 21.25 7.62244H22.75ZM20.5019 5.76651C20.9453 6.16402 21.2131 6.72111 21.2465 7.3157L22.7441 7.23158C22.6884 6.24061 22.2422 5.31211 21.5031 4.64959L20.5019 5.76651ZM22 7.25H20.5V8.75H22V7.25ZM18.25 9.5V11.9189H19.75V9.5H18.25ZM19.7885 14.0534L21.7628 14.7115L22.2372 13.2885L20.2628 12.6304L19.7885 14.0534ZM18.25 11.9189C18.25 12.8873 18.8697 13.7471 19.7885 14.0534L20.2628 12.6304C19.9566 12.5283 19.75 12.2417 19.75 11.9189H18.25ZM20.5 7.25C19.2574 7.25 18.25 8.25736 18.25 9.5H19.75C19.75 9.08579 20.0858 8.75 20.5 8.75V7.25Z" fill="currentcolor"/>
            </svg>

        ), 
        modelsIcon:(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9C10.3431 9 9 7.65685 9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6C15 7.65685 13.6569 9 12 9Z" stroke="currentcolor" stroke-width="1.5"/>
                <path d="M5.5 21C3.84315 21 2.5 19.6569 2.5 18C2.5 16.3431 3.84315 15 5.5 15C7.15685 15 8.5 16.3431 8.5 18C8.5 19.6569 7.15685 21 5.5 21Z" stroke="currentcolor" stroke-width="1.5"/>
                <path d="M18.5 21C16.8431 21 15.5 19.6569 15.5 18C15.5 16.3431 16.8431 15 18.5 15C20.1569 15 21.5 16.3431 21.5 18C21.5 19.6569 20.1569 21 18.5 21Z" stroke="currentcolor" stroke-width="1.5"/>
                <path opacity="0.5" d="M20 13C20 10.6106 18.9525 8.46589 17.2916 7M4 13C4 10.6106 5.04752 8.46589 6.70838 7M10 20.748C10.6392 20.9125 11.3094 21 12 21C12.6906 21 13.3608 20.9125 14 20.748" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>

        ),
        brandIcon:(
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.5" d="M11.1459 7.02251C11.5259 6.34084 11.7159 6 12 6C12.2841 6 12.4741 6.34084 12.8541 7.02251L12.9524 7.19887C13.0603 7.39258 13.1143 7.48944 13.1985 7.55334C13.2827 7.61725 13.3875 7.64097 13.5972 7.68841L13.7881 7.73161C14.526 7.89857 14.895 7.98205 14.9828 8.26432C15.0706 8.54659 14.819 8.84072 14.316 9.42898L14.1858 9.58117C14.0429 9.74833 13.9714 9.83191 13.9392 9.93531C13.9071 10.0387 13.9179 10.1502 13.9395 10.3733L13.9592 10.5763C14.0352 11.3612 14.0733 11.7536 13.8435 11.9281C13.6136 12.1025 13.2682 11.9435 12.5773 11.6254L12.3986 11.5431C12.2022 11.4527 12.1041 11.4075 12 11.4075C11.8959 11.4075 11.7978 11.4527 11.6014 11.5431L11.4227 11.6254C10.7318 11.9435 10.3864 12.1025 10.1565 11.9281C9.92674 11.7536 9.96476 11.3612 10.0408 10.5763L10.0605 10.3733C10.0821 10.1502 10.0929 10.0387 10.0608 9.93531C10.0286 9.83191 9.95713 9.74833 9.81418 9.58117L9.68403 9.42898C9.18097 8.84072 8.92945 8.54659 9.01723 8.26432C9.10501 7.98205 9.47396 7.89857 10.2119 7.73161L10.4028 7.68841C10.6125 7.64097 10.7173 7.61725 10.8015 7.55334C10.8857 7.48944 10.9397 7.39258 11.0476 7.19887L11.1459 7.02251Z" stroke="currentcolor" stroke-width="1.5"/>
                <path d="M19 9C19 12.866 15.866 16 12 16C8.13401 16 5 12.866 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9Z" stroke="currentcolor" stroke-width="1.5"/>
                <path opacity="0.5" d="M12 16.0678L8.22855 19.9728C7.68843 20.5321 7.41837 20.8117 7.18967 20.9084C6.66852 21.1289 6.09042 20.9402 5.81628 20.4602C5.69597 20.2495 5.65848 19.8695 5.5835 19.1095C5.54117 18.6804 5.52 18.4658 5.45575 18.2861C5.31191 17.8838 5.00966 17.5708 4.6211 17.4219C4.44754 17.3554 4.24033 17.3335 3.82589 17.2896C3.09187 17.212 2.72486 17.1732 2.52138 17.0486C2.05772 16.7648 1.87548 16.1662 2.08843 15.6266C2.18188 15.3898 2.45194 15.1102 2.99206 14.5509L5.45575 12" stroke="currentcolor" stroke-width="1.5"/>
                <path opacity="0.5" d="M12 16.0678L15.7715 19.9728C16.3116 20.5321 16.5816 20.8117 16.8103 20.9084C17.3315 21.1289 17.9096 20.9402 18.1837 20.4602C18.304 20.2495 18.3415 19.8695 18.4165 19.1095C18.4588 18.6804 18.48 18.4658 18.5442 18.2861C18.6881 17.8838 18.9903 17.5708 19.3789 17.4219C19.5525 17.3554 19.7597 17.3335 20.1741 17.2896C20.9081 17.212 21.2751 17.1732 21.4786 17.0486C21.9423 16.7648 22.1245 16.1662 21.9116 15.6266C21.8181 15.3898 21.5481 15.1102 21.0079 14.5509L18.5442 12" stroke="currentcolor" stroke-width="1.5"/>
            </svg>

        ),
        employeeIcon: (
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

    const navItems = [
        { label: 'Clientes', href: '/apps/clientes', icon: 'customersIcon' },
        { label: 'Renta Y Devolucion', href: '/apps/rentaDevolucion', icon: 'rentIcon' },
        { label: 'Inspeccion', href: '/apps/inspeccion', icon: 'inspecIcon' },
    ];

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

                            {navItems.map((item, index) => (
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
                            ))}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
