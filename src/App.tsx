import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Help } from './screens/Help';
import { Hire } from './screens/Hire';
import { JobDetail } from './screens/JobDetail';
import { MyJobs } from './screens/MyJobs';
import { Onboarding } from './screens/Onboarding';
import { Profile } from './screens/Profile';
import { Welcome } from './screens/Welcome';
import { WorkHome } from './screens/WorkHome';

const worker = (el: React.ReactNode) => <AppShell mode="worker">{el}</AppShell>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/start" element={<Onboarding />} />
      <Route path="/work" element={worker(<WorkHome />)} />
      <Route path="/work/:id" element={worker(<JobDetail />)} />
      <Route path="/my-jobs" element={worker(<MyJobs />)} />
      <Route path="/card" element={worker(<Profile />)} />
      <Route path="/help" element={worker(<Help />)} />
      <Route path="/hire" element={<AppShell mode="employer"><Hire /></AppShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
