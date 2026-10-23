import { useEffect } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { IconBook, IconGrid, IconHome, IconRepeat, IconSettings } from "./components/icons";
import { Home } from "./features/Home";
import { Learn } from "./features/learn/Learn";
import { NotationLessonPage } from "./features/notation/Lesson";
import { NotationList } from "./features/notation/NotationList";
import { OpeningDetail } from "./features/openings/Detail";
import { Library } from "./features/openings/Library";
import { Practice } from "./features/practice/Practice";
import { Review } from "./features/review/Review";
import { Settings } from "./features/settings/Settings";
import { useDueCount } from "./features/progress";
import { useApp } from "./store";

function ThemeSync() {
  const theme = useApp((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Nav() {
  const due = useDueCount();
  const link = (to: string, label: string, icon: JSX.Element, end = false, badge?: number) => (
    <NavLink to={to} end={end} className={({ isActive }) => `nav__link${isActive ? " active" : ""}`}>
      {icon}
      <span>{label}</span>
      {badge ? (
        <span className="nav__badge" aria-label={`${badge} due`}>
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </NavLink>
  );
  return (
    <nav className="nav" aria-label="Main">
      <NavLink to="/" className="nav__brand">
        Practice Chess Openings
      </NavLink>
      <div className="nav__links">
        {link("/", "Home", <IconHome />, true)}
        {link("/openings", "Openings", <IconBook />)}
        {link("/review", "Review", <IconRepeat />, false, due)}
        {link("/notation", "Notation", <IconGrid />)}
        {link("/settings", "Settings", <IconSettings />)}
      </div>
    </nav>
  );
}

export function App() {
  const storageAvailable = useApp((s) => s.storageAvailable);
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeSync />
      <ScrollToTop />
      <div className="app">
        {!storageAvailable && (
          <div className="banner" role="status">
            Your browser is blocking storage, so progress will only last until you close this tab.
          </div>
        )}
        <Nav />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/openings" element={<Library />} />
            <Route path="/openings/:openingId" element={<OpeningDetail />} />
            <Route path="/openings/:openingId/learn" element={<Learn />} />
            <Route path="/openings/:openingId/practice" element={<Practice />} />
            <Route path="/review" element={<Review />} />
            <Route path="/notation" element={<NotationList />} />
            <Route path="/notation/:lessonId" element={<NotationLessonPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="card">
      <h1>Page not found</h1>
      <p>
        <a href="/">Go home</a>
      </p>
    </div>
  );
}
