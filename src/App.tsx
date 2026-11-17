import { Spin } from 'antd';
import { useAuth } from './auth/useAuth';
import { AuthPage } from './pages/AuthPage';
import { TodosPage } from './pages/TodosPage';

export default function App() {
  const { state } = useAuth();
  console.log("Я не читирил")
  switch (state.status) {
    case 'loading':
      return (
        <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Загрузка">
          <Spin size="large" />
        </div>
      );
    case 'anonymous':
      return <AuthPage />;
    case 'authenticated':
      return <TodosPage user={state.user} />;
  }
}
