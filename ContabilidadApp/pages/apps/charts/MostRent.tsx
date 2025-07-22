import Link from 'next/link';
import sortBy from 'lodash/sortBy';
import { NextPageContext } from 'next';
import { IRootState } from '../../../store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import {showMessage, showConfirm} from '@/utils/notifications';
import {formatDateTime} from '@/utils/utilities';
import { apiGet, apiDelete } from '@/lib/api/main';
import VehiculosMasRentados from '@/components/pages/mostrent/mostrent';



const MostRent = () => {


        const dispatch = useDispatch();
        useEffect(() => {
            dispatch(setPageTitle('Order Sorting Table'));
        });
        const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    
      

        return (
            <>
               
                    <VehiculosMasRentados/>
                
            </>
        );
 
};

export default MostRent;