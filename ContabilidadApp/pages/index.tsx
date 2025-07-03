import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Dropdown from '../components/Dropdown';
import { setPageTitle } from '../store/themeConfigSlice';
import dynamic from 'next/dynamic';
import { AuthContext, useAuth } from '@/src/context/authContext';
import VehiculosMasRentados from '@/components/pages/mostrent/mostrent';
import VehiculosRentadosVsDisponibles from '@/components/pages/vs/vs';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});
import Link from 'next/link';

const Index = () => {
    const dispatch = useDispatch();
    const { auth } = useAuth();

    useEffect(() => {
        dispatch(setPageTitle('Home'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === 'dark' ? true : false;
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;


    return (
        <>
            <div>
            <div className="panel">
             <div className='mb-6'><VehiculosMasRentados/></div>
                   
                </div>
            </div>
        </>
    );
};


export default Index;
