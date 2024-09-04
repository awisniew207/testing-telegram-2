import React, { useEffect, useCallback } from "react";

import { type TelegramUser } from "./types";

interface TelegramLoginButtonProps {
  dataOnauth: (user: TelegramUser) => void;
}

declare global {
  interface Window {
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
  dataOnauth,
}) => {
  const handleAuth = useCallback(
    (user: TelegramUser) => {
      console.log("Telegram user:", user);
      dataOnauth(user);
    },
    [dataOnauth]
  );

  useEffect(() => {
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
  }, [handleAuth]);

  return null;
};

export default TelegramLoginButton;