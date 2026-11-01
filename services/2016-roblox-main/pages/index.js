import { useEffect } from "react";
import AuthenticationStore from "../stores/authentication";

const IndexPage = () => {
  const auth = AuthenticationStore.useContainer();

  useEffect(() => {
    if (auth.isPending) return;
    window.location.replace(auth.isAuthenticated ? "/home" : "/login");
  }, [auth.isAuthenticated, auth.isPending]);

  return (
    <main className="container">
      <p role="status" aria-live="polite">
        Loading Economy Simulator…
      </p>
    </main>
  );
};

export default IndexPage;
