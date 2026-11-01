import { useEffect } from "react";
import LoginPage from "../components/loginPage";
import AuthenticationStore from "../stores/authentication";

const IndexPage = () => {
  const auth = AuthenticationStore.useContainer();

  useEffect(() => {
    if (auth.isPending || !auth.isAuthenticated) return;
    window.location.replace("/home");
  }, [auth.isAuthenticated, auth.isPending]);

  if (auth.isPending) {
    return (
      <main className="container">
        <p role="status" aria-live="polite">Loading Economy Simulator…</p>
      </main>
    );
  }

  return <LoginPage />;
};

export default IndexPage;
