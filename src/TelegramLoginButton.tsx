import React, { useEffect, useRef, useCallback } from "react";

import { type TelegramUser } from "./types";

interface TelegramLoginButtonProps {
  botName?: string;
  dataOnauth: (user: TelegramUser) => void;
  buttonSize?: "large" | "medium" | "small";
  requestAccess?: "write" | "read";
  useWebApp?: boolean;
}

declare global {
  interface Window {
    TelegramLoginCallback?: (user: TelegramUser) => void;
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user: {
            id: string;
            first_name: string;
            username: string;
          };
          auth_date: string;
          hash: string;
        };
        expand: () => void;
      };
    };
  }
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botName,
  dataOnauth,
  buttonSize = "large",
  requestAccess = "write",
  useWebApp = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAuth = useCallback(
    (user: TelegramUser) => {
      console.log("Telegram user:", user);
      dataOnauth(user);
    },
    [dataOnauth]
  );

  useEffect(() => {
    if (useWebApp) {
      if (window.Telegram) {
        const telegramApp = window.Telegram.WebApp;
        const telegramAppData = telegramApp.initDataUnsafe;
        const userObject: TelegramUser = {
          id: Number(telegramAppData.user.id),
          first_name: telegramAppData.user.first_name,
          username: telegramAppData.user.username,
          auth_date: Number(telegramAppData.auth_date),
          hash: telegramAppData.hash,
        };
        console.log("user object: ", userObject);
        handleAuth(userObject);
        telegramApp.expand();
      }
    } else {
      // Legacy button logic
      window.TelegramLoginCallback = handleAuth;

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", botName || "");
      script.setAttribute("data-size", buttonSize);
      script.setAttribute("data-request-access", requestAccess);
      script.setAttribute("data-onauth", "TelegramLoginCallback(user)");

      containerRef.current?.appendChild(script);

      return () => {
        containerRef.current?.removeChild(script);
        delete window.TelegramLoginCallback;
      };
    }
  }, [botName, handleAuth, buttonSize, requestAccess, useWebApp]);

  return useWebApp ? null : <div ref={containerRef}></div>;
};

export default TelegramLoginButton;