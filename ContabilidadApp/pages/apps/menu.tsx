import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { setPageTitle } from '../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';

const Menu = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Danny'));
    });

    return (
        <div style={{'height': '78vh'}}>
            {/* <frameset rows="100%,*" border="0"><frame src="http://apps2.genxc.com:2203/menu_app/LoginMenu.php" frameborder="0"></frameset>             */}
            {/* <iframe width="100%" height="80%" src="http://apps2.genxc.com:2203/menu_app/LoginMenu.php" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe> */}
            {/* <iframe width="100%" height="100%" src="https://apps2.genxc.com/university" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe> */}
            <iframe width="100%" height="100%" src="http://apps2.genxc.com:2001/web/auth/login" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
        </div>
    )
}
// Danny.getLayout = (page: any) => {
//     return <BlankLayout>{page}</BlankLayout>;
// };
export default Menu;