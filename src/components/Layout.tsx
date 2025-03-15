import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div>
      <header></header>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </div>
  );
};

export default Layout;
