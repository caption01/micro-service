import buildClient from "../api/buildClient";

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are Signed In</h1>
  ) : (
    <h1>You are not Signed In</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);

  console.log("LANDING PAGE");

  const { data } = await client.get("/api/users/currentuser");

  return data;
};

export default LandingPage;
