import React, { createContext, useReducer, useContext, useEffect } from "react";
import authReducer from "./authReducer";
import supabase from "auth/supabase";
import { randomHash } from "helpers";

const initValue = { userId: null, email: null, error: "" };
const AuthContext = createContext(initValue);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initValue);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        const { id, email } = session.user;
        dispatch({
          type: "LOG_IN",
          payload: { userId: id, email },
        });
      } else {
        dispatch({ type: "LOG_OUT" });
      }
    });
  }, []);

  //ACTIONS
  const logInAnonymous = async () => {
    await supabase.auth.signUp({
      email: `${randomHash(36)}@listen-together-aryan.netlify.app`,
      password: "example-password",
    });
  };
  const logIn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const invite = urlParams.get("invite");
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.href}` },
      });
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error });
    }
  };
  const logOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error });
    }
  };
  const dismissError = () => {
    dispatch({ type: "AUTH_ERROR_DISMISS" });
  };

  const value = {
    ...state,
    logInAnonymous,
    logIn,
    logOut,
    dismissError,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth should be use within its provider");
  }

  return context;
};

export default useAuth;
