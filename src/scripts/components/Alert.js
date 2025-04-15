import Swal from 'sweetalert2';

export const showAlert = ({
    title = '',
    text = '',
    icon = 'info',
    confirmButtonText = 'OK',
    cancelButtonText = 'Cancel',
    showCancelButton = false,
    allowOutsideClick = true,
    onConfirm = null,
    onCancel = null,
  }) => {
    const swalOptions = {
      title,
      text,
      icon,
      showCancelButton,
      confirmButtonText,
      cancelButtonText,
      allowOutsideClick,
    };
  
    const swalInstance = Swal.fire(swalOptions);
  
    swalInstance.then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      } else if (result.isDismissed && onCancel) {
        onCancel();
      }
    });
  };
  
  export const showLoadingAlert = (message = 'Loading...') => {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };
  
  export const closeAlert = () => {
    Swal.close();
  };
  