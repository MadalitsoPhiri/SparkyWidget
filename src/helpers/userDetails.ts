async function get_user_info() {
    const location = await getUserLocation();
    const { device, browser } = deviceAndBroswerType();
 
  
    return { location, device, browser };
  }
  
  async function getUserLocation() {
    try {
      const response = await fetch("https://ipapi.co/json", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
  
      return data;
    } catch (error:any) {
      console.log("Error:", error.message);
      throw error.message;
    }

  }
  
  function deviceAndBroswerType() {
    const ua = navigator.userAgent;
    const browser = checkBrowser(ua);
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return { device: "tablet", browser };
    } else if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return { device: "mobile", browser };
    }
    return { device: "desktop", browser };
  }
  
  function checkBrowser(userAgentString:string) {
    if (userAgentString.indexOf("Chrome") > -1) {
      return "Chrome";
    } else if (userAgentString.indexOf("Firefox") > -1) {
      return "Firefox";
    } else if (
      userAgentString.indexOf("MSIE") > -1 ||
      userAgentString.indexOf("rv:") > -1
    ) {
      return "MSIE";
    } else if (userAgentString.indexOf("Safari") > -1) {
      return "Safari";
    } else if (userAgentString.indexOf("OP") > -1) {
      return "Opera";
    } else {
      return "Microsoft Egde";
    }
  }
  
  export { get_user_info };