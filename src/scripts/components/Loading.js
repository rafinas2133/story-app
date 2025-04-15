import Swal from 'sweetalert2';

export class Loading {
    static show(message = 'Loading...') {
      Swal.fire({
        title: message,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    }
  
    static hide() {
      Swal.close();
    }
  }