import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { Router, useRouter } from "next/router";
import { useEffect } from "react";

const Logout: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!!session) {
      signOut({ redirect: false, callbackUrl: "/" });
    } else {
      router.replace("/");
    }
  });
  return <></>;
};

export default Logout;
