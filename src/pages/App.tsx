import { NotificationProvider } from "./context/NotificationContext";
import ToastHandler from "./components/notifications/ToastHandler";
import CursorGlow from "./components/common/CursorGlow";


function App() {
  return (
    <NotificationProvider>
      <CursorGlow />
      <ToastHandler />
      {/* app routes */}
    </NotificationProvider>
  );
}