import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div>
      <header>
        <h1>Моё приложение</h1>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>© 2025</p>
      </footer>
    </div>
  );
};

export default Layout;