import { Typography } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import UserService, { User } from "../../src/backend/UserService";

interface ServerSideProps {
  user: User;
}

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (
  context
) => {
  const session = await getSession(context);
  if (!session) {
    const dest = new URL(`${process.env.NEXTAUTH_URL}`);
    dest.pathname = "/api/auth/signin";
    dest.searchParams.set("error", "SessionRequired");
    dest.searchParams.set("callbackUrl", context.resolvedUrl);
    return {
      redirect: {
        permanent: false,
        destination: dest.toString(),
      },
    };
  }

  const userService = new UserService(session.bearerToken as string);
  const user = await userService.getUser(context.query.userId as string);
  if (!user) {
    return { notFound: true };
  }

  return {
    props: { user },
  };
};

const Profile: NextPage<ServerSideProps> = ({ user }) => {
  return (
    <Typography variant="h4" component="h1">
      {`${user.id}: ${user.email}`}
    </Typography>
  );
};

export default Profile;
