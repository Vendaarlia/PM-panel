function useGlobalToast() {
  const showToast = (message, type = "info", duration = 3e3) => {
    window.dispatchEvent(new CustomEvent("show-toast", {
      detail: { message, type, duration }
    }));
  };
  return {
    success: (msg, duration) => showToast(msg, "success", duration),
    error: (msg, duration) => showToast(msg, "error", duration),
    warning: (msg, duration) => showToast(msg, "warning", duration),
    info: (msg, duration) => showToast(msg, "info", duration),
    show: showToast
  };
}

export { useGlobalToast as u };
