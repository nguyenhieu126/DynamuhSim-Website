import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import ManualControl from "./pages/ManualControl";
import MappingNavigation from "./pages/MappingNavigation";
import AIMonitoring from "./pages/AIMonitoring";
import SensorsTelemetry from "./pages/SensorsTelemetry";
import Settings from "./pages/Settings";
import { Button, Empty } from "./components/common/UI";
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/manual-control", element: <ManualControl /> },
      { path: "/mapping-navigation", element: <MappingNavigation /> },
      { path: "/ai-monitoring", element: <AIMonitoring /> },
      { path: "/sensors-telemetry", element: <SensorsTelemetry /> },
      { path: "/settings", element: <Settings /> },
      {
        path: "*",
        element: (
          <>
            <Empty
              title="Page not found"
              detail="Choose a page from the navigation."
            />
            <Button onClick={() => window.location.assign("/")}>
              Dashboard
            </Button>
          </>
        ),
      },
    ],
  },
]);
export default function App() {
  return <RouterProvider router={router} />;
}
