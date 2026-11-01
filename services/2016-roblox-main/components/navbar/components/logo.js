import NavigationStore from "../../../stores/navigation";

const Logo = () => {
  const navStore = NavigationStore.useContainer();

  return (
    <div className="navbar-logo__column col-2 col-lg-2">
      <button
        type="button"
        className="navbar-logo__toggle"
        aria-label={navStore.isSidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={navStore.isSidebarOpen}
        onClick={() => navStore.setIsSidebarOpen(!navStore.isSidebarOpen)}
      >
        <span className="navbar-logo__toggle-icon" aria-hidden="true" />
      </button>
      <img className="navbar-logo__desktop" src="/img/roblox_logo.svg" alt="Roblox" width="118" height="30" />
      <div className="navbar-logo__mobile-wrapper">
        <img className="navbar-logo__mobile" src="/img/logo_R.svg" alt="Roblox" width="30" height="30" />
      </div>
    </div>
  );
};

export default Logo;
