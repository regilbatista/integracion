import Link from "next/link";
// import { useTranslation } from 'react-i18next';
// const { t } = useTranslation();


const NavItem = (props: { t: { t: any; }}, children:any) => {

    const { t } = props.t;

    return (<>
        <li className="nav-item">
            <Link href="/apps/menu" className="group">
                <div className="flex items-center">
                    {children}
                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Menu')}</span>
                </div>
            </Link>
        </li>
    </>)
};

export default NavItem;