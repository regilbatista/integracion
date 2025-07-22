import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import Swal from 'sweetalert2';
import { API_URL } from '@/utils/constants';

const Unauthorized = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Unauthorized'));

      
    }, [dispatch]);

    return (
        <div className="mb-5">
            <h1 className="text-xl font-semibold text-red-500">Unauthorized Access</h1>
        </div>
    );
};

export default Unauthorized;

