import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { config_selector } from "../../store/slices/configSlice";

export const useDimensions = () => {
  const { host_dimens } = useSelector(config_selector);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  useEffect(() => {
    if (host_dimens.width && host_dimens.height) {
      if (host_dimens.width < 450) {
        setIsMobile(true);
        setIsTablet(false);
      } else if (host_dimens.width > 601 && host_dimens.width < 1280) {
        setIsMobile(false);
        setIsTablet(true);
      } else {
        setIsMobile(false);
        setIsTablet(false);
      }
    }
  }, [host_dimens]);
  return { isMobile, isTablet };
};
