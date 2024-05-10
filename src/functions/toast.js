import { toast, Bounce } from "react-toastify";

export const notify = ({ text, error, success, testMode }) => {
  if (error) {
    toast.error(text);
  }
  if (success) {
    toast.success(text);
  }
  if (testMode) {
    toast.warn("NOTE!!! This account is not monitored!!!", {
      position: "top-center",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  }
};
