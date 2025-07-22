import Swal from 'sweetalert2';

export const showMessage = ({ msg = '', type = 'success' }) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        customClass: { container: 'toast' },
    });
    toast.fire({
        icon: type,
        title: msg,
        padding: '10px 20px',
    });
};

export const showConfirm = async (deleteFuntion, customMessage) => {
    const defaultMessage = "You will be unable to use this until you activate it again!";

    Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: customMessage || defaultMessage,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        padding: '2em',
        customClass: {
            popup: 'sweet-alerts-popup',
            title: 'sweet-alerts-title',
            cancelButton: 'sweet-alerts-cancel',
            confirmButton: 'sweet-alerts-confirm',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            deleteFuntion();
            // Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
        }
    });
};