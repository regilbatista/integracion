import { AuthContext } from '@/src/context/authContext';
import Swal from 'sweetalert2';
import { API_URL } from '@/utils/constants';
export const getToken = (name) => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';

export const returnUnauthorized = () => {
    return {
        redirect: {
            destination: '/unauthorized',
        },
    };
};

export function permissionRequired(requiredPermissions, userPermissions) {
    //if any of the required permissions is in the user permissions OR userPermissions has 'sys-adm', return true
    return requiredPermissions.some((permission) => userPermissions.includes(permission))
        || userPermissions.includes('sys-adm');
}


export function getUserFromStorage() {
    const storedUserData = JSON.parse(localStorage.getItem('userData') ?? '{}');
    const { id, user, permissions,} = storedUserData;

    return new AuthContext({
        id,
        user,
        permissions,
    });
}

export function showUnauthorized() {
    Swal.fire({
        icon: 'error',
        title: 'Session expired',
        text: 'Your session has expired. Log back in to renew your session.',
        padding: '2em',
        customClass: 'sweet-alerts',
    }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
            localStorage.removeItem('userData');
            window.location.href = `${API_URL}/logout`;
        }
    });
}

