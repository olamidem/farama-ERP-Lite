import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { useLogout } from "./useLogout";
import { unlockWithPin } from "../services/auth.service";

const PIN_LENGTH = 4;

export const useLockScreen = () => {
  const user = useAuthStore((state) => state.user);
  const setLocked = useAuthStore((state) => state.setLocked);
  const { mutateAsync: logout } = useLogout();
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const appendDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    setPin((prev) => prev + digit);
  };

  const deleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const clearPin = () => {
    setPin("");
  };

  const unlock = async () => {
    if (!user) return;
    setIsVerifying(true);

    try {
      const valid = await unlockWithPin(user.id, pin);
      if (valid) {
        setLocked(false);
        setPin("");
        setErrorCount(0);
        toast.success("Welcome back.");
        navigate({ to: "/dashboard" });
        return;
      }

      setErrorCount((c) => c + 1);
      setShakeTrigger(true);
      setTimeout(() => {
        setShakeTrigger(false);
      }, 400);

      setPin("");

      toast.error("Incorrect PIN");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to unlock."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const switchAccount = async () => {
    await logout();
    toast.info("Please sign in.");
  };

  return {
    pin,
    errorCount,
    shakeTrigger,
    isVerifying,
    appendDigit,
    deleteDigit,    clearPin,
    unlock,
    switchAccount,
    pinLength: PIN_LENGTH,
  };
};

export default useLockScreen;