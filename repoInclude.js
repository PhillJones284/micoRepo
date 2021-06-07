function resizeIframe(iframe) {
    iframe.height = iframe.contentWindow.document.body.scrollHeight + "px";
  }

  window.onmessage = (e) => {
    if (e.data.hasOwnProperty("frameHeight")) {
      document.getElementById("repoiFrame").style.height = `${e.data.frameHeight + 30}px`;
    }
  };
